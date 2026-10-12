import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Upload, 
  Plus, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  X,
  FileSpreadsheet
} from 'lucide-react';
import { FeedbackRecord } from '../types';
import { exportToCSV, downloadFile, parseFeedbackCSV } from '../utils/csvParser';

interface FeedbackTabProps {
  records: FeedbackRecord[];
  onUpdateRecord: (updated: FeedbackRecord) => void;
  onAddRecord: (newRecord: FeedbackRecord) => void;
  onLoadCsvRecords: (newRecords: FeedbackRecord[]) => void;
  onLoadOfficialDataset: () => void;
  isDemoData: boolean;
}

export const FeedbackTab: React.FC<FeedbackTabProps> = ({
  records,
  onUpdateRecord,
  onAddRecord,
  onLoadCsvRecords,
  onLoadOfficialDataset,
  isDemoData,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [sentimentFilter, setSentimentFilter] = useState('ALL');
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'priority_desc' | 'priority_asc' | 'date_desc' | 'sentiment_asc' | 'sentiment_desc'>('priority_desc');

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const [selectedRecord, setSelectedRecord] = useState<FeedbackRecord | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [newReview, setNewReview] = useState('');
  const [newCategory, setNewCategory] = useState('Customer Service');
  const [newSource, setNewSource] = useState('Zendesk');
  const [newCustomer, setNewCustomer] = useState('');

  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<{ total: number; preview: Record<string, string>[]; mapping: any } | null>(null);
  const [isParsingCsv, setIsParsingCsv] = useState(false);
  const [csvError, setCsvError] = useState<string | null>(null);

  const categories = useMemo(() => {
    const set = new Set<string>();
    records.forEach(r => { if (r.category) set.add(r.category); });
    return Array.from(set).sort();
  }, [records]);

  const sources = useMemo(() => {
    const set = new Set<string>();
    records.forEach(r => { if (r.source) set.add(r.source); });
    return Array.from(set).sort();
  }, [records]);

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matchesReview = r.review.toLowerCase().includes(q);
        const matchesCategory = r.category.toLowerCase().includes(q);
        const matchesCustomer = (r.customer || '').toLowerCase().includes(q);
        const matchesId = r.id.toLowerCase().includes(q);
        if (!matchesReview && !matchesCategory && !matchesCustomer && !matchesId) {
          return false;
        }
      }

      if (categoryFilter !== 'ALL' && r.category !== categoryFilter) return false;
      if (sentimentFilter !== 'ALL' && r.sentiment !== sentimentFilter) return false;
      if (sourceFilter !== 'ALL' && r.source !== sourceFilter) return false;
      if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;

      return true;
    }).sort((a, b) => {
      switch (sortBy) {
        case 'priority_desc':
          return b.priorityScore - a.priorityScore;
        case 'priority_asc':
          return a.priorityScore - b.priorityScore;
        case 'sentiment_asc':
          return a.sentimentScore - b.sentimentScore;
        case 'sentiment_desc':
          return b.sentimentScore - a.sentimentScore;
        case 'date_desc':
        default:
          return (b.date || '').localeCompare(a.date || '');
      }
    });
  }, [records, searchTerm, categoryFilter, sentimentFilter, sourceFilter, statusFilter, sortBy]);

  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  const handleFilterChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (val: string) => {
    setter(val);
    setCurrentPage(1);
  };

  const handleFileChange = async (file: File) => {
    setCsvFile(file);
    setCsvError(null);
    setIsParsingCsv(true);

    try {
      const text = await file.text();
      const parsed = await parseFeedbackCSV(text);
      setCsvPreview({
        total: parsed.totalParsed,
        preview: parsed.previewRows,
        mapping: parsed.detectedMapping,
      });
    } catch (err: any) {
      setCsvError(err?.message || 'Failed to parse CSV file. Ensure valid comma-delimited columns.');
      setCsvPreview(null);
    } finally {
      setIsParsingCsv(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!csvFile) return;
    try {
      const text = await csvFile.text();
      const parsed = await parseFeedbackCSV(text);
      onLoadCsvRecords(parsed.records);
      setIsImportModalOpen(false);
      setCsvFile(null);
      setCsvPreview(null);
    } catch (err: any) {
      setCsvError(err?.message || 'Error executing CSV import.');
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.trim()) return;

    const id = `fb-${Date.now().toString().slice(-4)}`;
    const textLower = newReview.toLowerCase();
    const isFraud = newCategory === 'Fraud and Scam' || textLower.includes('fraud') || textLower.includes('scam');
    const isNeg = textLower.includes('bad') || textLower.includes('delayed') || textLower.includes('unresponsive');

    const sentiment = isFraud || isNeg ? 'negative' : 'positive';
    const sentimentScore = sentiment === 'negative' ? -0.8 : 0.8;
    const priorityScore = isFraud ? 96 : isNeg ? 72 : 20;
    const severity = isFraud ? 'critical' : isNeg ? 'high' : 'low';

    const newRecord: FeedbackRecord = {
      id,
      review: newReview.trim(),
      category: newCategory,
      source: newSource,
      date: new Date().toISOString().split('T')[0],
      customer: newCustomer.trim() || `manual_user_${id}@feedback.internal`,
      sentiment,
      sentimentScore,
      priorityScore,
      severity,
      status: 'open',
      isAiAnalyzed: false,
    };

    onAddRecord(newRecord);
    setNewReview('');
    setNewCustomer('');
    setIsAddModalOpen(false);
  };

  const handleExportFiltered = () => {
    const csvStr = exportToCSV(filteredRecords);
    downloadFile(csvStr, `InsightFlow_Feedback_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv');
  };

  return (
    <div className="space-y-4">
      {/* Top Header & Action Controls */}
      <div className="bg-white rounded-md p-5 border border-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Customer Feedback Ledger</h2>
            <span className="text-xs text-slate-500 font-mono">
              · {filteredRecords.length.toLocaleString()} of {records.length.toLocaleString()} records
            </span>
            {isDemoData && (
              <span className="text-[11px] text-amber-700 font-mono">
                [Preview Mode]
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Structured customer review ledger. Search, filter, and inspect raw evidence text.
          </p>
        </div>

        {/* Toolbar Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {isDemoData && (
            <button
              onClick={onLoadOfficialDataset}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-xs rounded border border-slate-200 transition-colors flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-slate-600" />
              Load Competition Dataset
            </button>
          )}

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs rounded border border-slate-300 transition-colors flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            Import CSV
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs rounded border border-slate-300 transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-slate-500" />
            Manual Entry
          </button>

          <button
            onClick={handleExportFiltered}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-md p-3.5 border border-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.03)] space-y-2.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5">
          {/* Search Input */}
          <div className="lg:col-span-2 relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search text, ID, or customer..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:border-slate-800"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => handleFilterChange(setCategoryFilter)(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:border-slate-800"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Sentiment Filter */}
          <div>
            <select
              value={sentimentFilter}
              onChange={(e) => handleFilterChange(setSentimentFilter)(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:border-slate-800"
            >
              <option value="ALL">All Sentiments</option>
              <option value="positive">Positive</option>
              <option value="neutral">Neutral</option>
              <option value="negative">Negative</option>
            </select>
          </div>

          {/* Source Filter */}
          <div>
            <select
              value={sourceFilter}
              onChange={(e) => handleFilterChange(setSourceFilter)(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:border-slate-800"
            >
              <option value="ALL">All Channels</option>
              {sources.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Sorting Order */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:border-slate-800"
            >
              <option value="priority_desc">Priority: High to Low</option>
              <option value="priority_asc">Priority: Low to High</option>
              <option value="sentiment_asc">Sentiment: Neg First</option>
              <option value="sentiment_desc">Sentiment: Pos First</option>
              <option value="date_desc">Date: Newest</option>
            </select>
          </div>
        </div>

        {/* Active Filter Indicators */}
        {(categoryFilter !== 'ALL' || sentimentFilter !== 'ALL' || sourceFilter !== 'ALL' || statusFilter !== 'ALL' || searchTerm) && (
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
            <span className="text-[11px] font-medium text-slate-500">Filtered by:</span>
            {categoryFilter !== 'ALL' && (
              <span className="text-[11px] font-mono text-slate-800">
                category={categoryFilter}
              </span>
            )}
            {sentimentFilter !== 'ALL' && (
              <span className="text-[11px] font-mono text-slate-800">
                · sentiment={sentimentFilter}
              </span>
            )}
            {sourceFilter !== 'ALL' && (
              <span className="text-[11px] font-mono text-slate-800">
                · channel={sourceFilter}
              </span>
            )}
            {searchTerm && (
              <span className="text-[11px] font-mono text-slate-800">
                · q="{searchTerm}"
              </span>
            )}
            <button
              onClick={() => {
                setCategoryFilter('ALL');
                setSentimentFilter('ALL');
                setSourceFilter('ALL');
                setStatusFilter('ALL');
                setSearchTerm('');
              }}
              className="text-[11px] text-slate-600 hover:text-slate-900 underline font-medium ml-auto"
            >
              Reset filters
            </button>
          </div>
        )}
      </div>

      {/* Main Feedback Table */}
      <div className="bg-white rounded-md border border-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                <th className="py-2.5 px-3.5 w-16 font-mono">ID</th>
                <th className="py-2.5 px-3.5 min-w-[320px]">Customer Feedback & Review</th>
                <th className="py-2.5 px-3.5 w-36">Category</th>
                <th className="py-2.5 px-3.5 w-24">Sentiment</th>
                <th className="py-2.5 px-3.5 w-28">Priority Score</th>
                <th className="py-2.5 px-3.5 w-28">Status</th>
                <th className="py-2.5 px-3.5 w-24">Channel</th>
                <th className="py-2.5 px-3.5 w-16 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <p className="text-xs font-mono">No matching feedback entries found</p>
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((item) => (
                  <tr 
                    key={item.id}
                    className="hover:bg-slate-50 transition-colors group cursor-pointer"
                    onClick={() => setSelectedRecord(item)}
                  >
                    <td className="py-3 px-3.5 font-mono text-[11px] text-slate-400">
                      {item.id}
                    </td>
                    <td className="py-3 px-3.5">
                      <p className="text-slate-900 font-medium line-clamp-2 leading-relaxed">
                        {item.review}
                      </p>
                      {item.customer && (
                        <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                          {item.customer} · {item.date}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3.5 text-slate-700">
                      {item.category}
                    </td>
                    <td className="py-3 px-3.5 font-medium">
                      <span className={`inline-flex items-center gap-1.5 ${
                        item.sentiment === 'positive'
                          ? 'text-emerald-700'
                          : item.sentiment === 'negative'
                          ? 'text-rose-700'
                          : 'text-amber-700'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-[1px] ${
                          item.sentiment === 'positive'
                            ? 'bg-emerald-600'
                            : item.sentiment === 'negative'
                            ? 'bg-rose-600'
                            : 'bg-amber-600'
                        }`} />
                        {item.sentiment}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 font-mono tabular-nums">
                      <span className={`font-semibold ${
                        item.severity === 'critical'
                          ? 'text-rose-700'
                          : item.severity === 'high'
                          ? 'text-amber-700'
                          : 'text-slate-800'
                      }`}>
                        {item.priorityScore}
                      </span>
                      <span className="text-slate-400 text-[10px] ml-1">({item.severity})</span>
                    </td>
                    <td className="py-3 px-3.5 text-slate-700 capitalize font-medium">
                      <span className="inline-flex items-center gap-1">
                        {item.status === 'resolved' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                        {item.status === 'in_progress' && <Clock className="w-3 h-3 text-slate-500" />}
                        {item.status === 'open' && <AlertCircle className="w-3 h-3 text-rose-600" />}
                        {item.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-slate-500 font-mono text-[11px]">
                      {item.source}
                    </td>
                    <td className="py-3 px-3.5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRecord(item);
                        }}
                        className="p-1 text-slate-400 hover:text-slate-900 rounded transition-colors"
                        title="View Entry Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="py-2.5 px-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 font-mono">
          <div className="flex items-center gap-3">
            <span>
              Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredRecords.length)} of {filteredRecords.length}
            </span>

            <div className="flex items-center gap-1 ml-2">
              <span className="text-slate-400">Page size:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-xs"
              >
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1 font-sans">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-2 py-1 rounded border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 py-1 text-xs text-slate-700 font-mono">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="px-2 py-1 rounded border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Record Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-md max-w-2xl w-full p-6 shadow-lg border border-slate-300 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-900">
                  {selectedRecord.id}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  · Priority: {selectedRecord.priorityScore}/100 ({selectedRecord.severity})
                </span>
              </div>
              <button 
                onClick={() => setSelectedRecord(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block mb-1">
                Original Customer Feedback Text
              </label>
              <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs font-medium text-slate-900 leading-relaxed italic">
                "{selectedRecord.review}"
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-500 text-[11px] block">Category</span>
                <strong className="text-slate-900 font-semibold">{selectedRecord.category}</strong>
              </div>
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-500 text-[11px] block">Sentiment</span>
                <strong className="text-slate-900 font-semibold capitalize">{selectedRecord.sentiment}</strong>
              </div>
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-500 text-[11px] block">Channel</span>
                <strong className="text-slate-900 font-semibold">{selectedRecord.source}</strong>
              </div>
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-500 text-[11px] block">Date</span>
                <strong className="text-slate-900 font-semibold font-mono">{selectedRecord.date}</strong>
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-slate-200 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <label className="font-semibold text-slate-700">Resolution Status:</label>
                  <select
                    value={selectedRecord.status}
                    onChange={(e) => {
                      const updated = { ...selectedRecord, status: e.target.value as any };
                      setSelectedRecord(updated);
                      onUpdateRecord(updated);
                    }}
                    className="px-2 py-1 text-xs border border-slate-300 rounded bg-white"
                  >
                    <option value="open">Open (Unresolved)</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <label className="font-semibold text-slate-700">Assignee:</label>
                  <input
                    type="text"
                    value={selectedRecord.assignedTo || ''}
                    onChange={(e) => {
                      const updated = { ...selectedRecord, assignedTo: e.target.value };
                      setSelectedRecord(updated);
                      onUpdateRecord(updated);
                    }}
                    placeholder="e.g. CX Lead, Trust & Safety"
                    className="px-2 py-1 text-xs border border-slate-300 rounded bg-white w-40"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Investigation & Remediation Notes:
                </label>
                <textarea
                  value={selectedRecord.notes || ''}
                  onChange={(e) => {
                    const updated = { ...selectedRecord, notes: e.target.value };
                    setSelectedRecord(updated);
                    onUpdateRecord(updated);
                  }}
                  rows={2}
                  placeholder="Record root-cause notes or resolution details..."
                  className="w-full p-2 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:border-slate-800"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-3.5 py-1.5 bg-slate-900 text-white rounded text-xs font-medium hover:bg-slate-800 transition-colors"
              >
                Close & Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-md max-w-xl w-full p-6 shadow-lg border border-slate-300 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-slate-700" />
                <h3 className="font-bold text-slate-900 text-sm">Import Customer Feedback CSV</h3>
              </div>
              <button 
                onClick={() => {
                  setIsImportModalOpen(false);
                  setCsvFile(null);
                  setCsvPreview(null);
                  setCsvError(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Upload a comma-separated feedback file. Column headers for review text, category, and metadata will be parsed automatically.
            </p>

            <div className="border border-dashed border-slate-300 hover:border-slate-500 rounded p-6 text-center bg-slate-50 transition-colors cursor-pointer relative">
              <input
                type="file"
                accept=".csv"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileChange(e.target.files[0]);
                  }
                }}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <FileSpreadsheet className="w-6 h-6 text-slate-600 mx-auto mb-1.5" />
              <p className="text-xs font-semibold text-slate-800">
                {csvFile ? csvFile.name : 'Select or drop CSV file'}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Comma-delimited with standard text quoting
              </p>
            </div>

            {isParsingCsv && (
              <div className="text-xs text-slate-600 text-center font-mono">
                Parsing schema...
              </div>
            )}

            {csvError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded text-xs">
                {csvError}
              </div>
            )}

            {csvPreview && (
              <div className="space-y-2 bg-slate-50 rounded p-3 border border-slate-200 text-xs">
                <div className="flex items-center justify-between font-semibold text-slate-900">
                  <span>Detected {csvPreview.total} rows</span>
                  <span className="text-emerald-700 font-mono text-[11px]">Valid Schema</span>
                </div>
                <div className="text-[11px] text-slate-600 space-y-0.5 font-mono">
                  <div>Review: {csvPreview.mapping.reviewCol}</div>
                  <div>Category: {csvPreview.mapping.categoryCol}</div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={onLoadOfficialDataset}
                className="text-xs text-slate-700 hover:text-slate-900 underline font-medium"
              >
                Use Built-in BuildBattle Dataset
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 text-slate-700 rounded text-xs font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!csvPreview}
                  onClick={handleConfirmImport}
                  className="px-3.5 py-1.5 bg-slate-900 text-white rounded text-xs font-medium hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none"
                >
                  Load Dataset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Entry Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-md max-w-lg w-full p-6 shadow-lg border border-slate-300 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm">Submit New Feedback Record</h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-medium text-slate-700 block mb-1">Feedback Statement *</label>
                <textarea
                  required
                  rows={3}
                  value={newReview}
                  onChange={(e) => setNewReview(e.target.value)}
                  placeholder="Enter verbatim customer comment..."
                  className="w-full p-2 bg-white border border-slate-300 rounded focus:outline-none focus:border-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full p-1.5 bg-white border border-slate-300 rounded focus:outline-none focus:border-slate-800"
                  >
                    <option value="Customer Service">Customer Service</option>
                    <option value="Product Feedback">Product Feedback</option>
                    <option value="Operational Issues">Operational Issues</option>
                    <option value="Fraud and Scam">Fraud and Scam</option>
                  </select>
                </div>

                <div>
                  <label className="font-medium text-slate-700 block mb-1">Channel Source</label>
                  <select
                    value={newSource}
                    onChange={(e) => setNewSource(e.target.value)}
                    className="w-full p-1.5 bg-white border border-slate-300 rounded focus:outline-none focus:border-slate-800"
                  >
                    <option value="Zendesk">Zendesk</option>
                    <option value="Trustpilot">Trustpilot</option>
                    <option value="App Store">App Store</option>
                    <option value="Survey">Customer Survey</option>
                    <option value="Executive Escalation">Executive Escalation</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">User Identifier (Optional)</label>
                <input
                  type="text"
                  value={newCustomer}
                  onChange={(e) => setNewCustomer(e.target.value)}
                  placeholder="e.g. client@domain.com"
                  className="w-full p-1.5 bg-white border border-slate-300 rounded focus:outline-none focus:border-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 text-slate-700 rounded text-xs font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-slate-900 text-white rounded text-xs font-medium hover:bg-slate-800"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
