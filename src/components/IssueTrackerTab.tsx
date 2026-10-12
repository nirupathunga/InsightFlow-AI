import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Edit3, 
  Download,
  Search,
  Check,
  X
} from 'lucide-react';
import { FeedbackRecord, IssueStatus } from '../types';
import { exportToCSV, downloadFile } from '../utils/csvParser';

interface IssueTrackerTabProps {
  records: FeedbackRecord[];
  onUpdateRecord: (updated: FeedbackRecord) => void;
  onNavigateToTab: (tab: string) => void;
}

export const IssueTrackerTab: React.FC<IssueTrackerTabProps> = ({
  records,
  onUpdateRecord,
}) => {
  const [statusFilter, setStatusFilter] = useState<'ALL' | IssueStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [editAssignee, setEditAssignee] = useState('');
  const [editStatus, setEditStatus] = useState<IssueStatus>('open');

  const openCount = records.filter(r => r.status === 'open').length;
  const inProgressCount = records.filter(r => r.status === 'in_progress').length;
  const resolvedCount = records.filter(r => r.status === 'resolved').length;

  const filteredIssues = records.filter(r => {
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return r.review.toLowerCase().includes(q) || 
             r.category.toLowerCase().includes(q) || 
             (r.notes || '').toLowerCase().includes(q) ||
             (r.assignedTo || '').toLowerCase().includes(q);
    }
    return true;
  });

  const handleStartEdit = (r: FeedbackRecord) => {
    setEditingId(r.id);
    setEditNotes(r.notes || '');
    setEditAssignee(r.assignedTo || '');
    setEditStatus(r.status);
  };

  const handleSaveEdit = (r: FeedbackRecord) => {
    onUpdateRecord({
      ...r,
      notes: editNotes.trim(),
      assignedTo: editAssignee.trim(),
      status: editStatus,
    });
    setEditingId(null);
  };

  const handleExportIssues = () => {
    const csv = exportToCSV(filteredIssues);
    downloadFile(csv, `InsightFlow_IssueTracker_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-md p-5 border border-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Issue Tracking & Remediation Register</h2>
            <span className="text-xs font-mono text-slate-500">
              · {filteredIssues.length} issues
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Internal workflow board for assigning departmental owners, recording investigation notes, and tracking resolution status.
          </p>
        </div>

        <button
          onClick={handleExportIssues}
          className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded transition-colors flex items-center gap-1.5 self-start md:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          Export Issue Log CSV
        </button>
      </div>

      {/* Status Summary Ledger */}
      <div className="bg-white border border-slate-200 rounded-md divide-y sm:divide-y-0 sm:divide-x divide-slate-200 grid grid-cols-1 sm:grid-cols-3 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <div 
          onClick={() => setStatusFilter(statusFilter === 'open' ? 'ALL' : 'open')}
          className={`p-4 transition-colors cursor-pointer ${
            statusFilter === 'open' ? 'bg-slate-50' : 'hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>STATUS: OPEN</span>
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <div className="my-1.5 text-2xl font-bold font-mono text-rose-700 tabular-nums">{openCount}</div>
          <span className="text-[11px] text-slate-500">Pending investigation</span>
        </div>

        <div 
          onClick={() => setStatusFilter(statusFilter === 'in_progress' ? 'ALL' : 'in_progress')}
          className={`p-4 transition-colors cursor-pointer ${
            statusFilter === 'in_progress' ? 'bg-slate-50' : 'hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>STATUS: IN PROGRESS</span>
            <Clock className="w-3.5 h-3.5 text-slate-600" />
          </div>
          <div className="my-1.5 text-2xl font-bold font-mono text-slate-900 tabular-nums">{inProgressCount}</div>
          <span className="text-[11px] text-slate-500">Active remediation</span>
        </div>

        <div 
          onClick={() => setStatusFilter(statusFilter === 'resolved' ? 'ALL' : 'resolved')}
          className={`p-4 transition-colors cursor-pointer ${
            statusFilter === 'resolved' ? 'bg-slate-50' : 'hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>STATUS: RESOLVED</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="my-1.5 text-2xl font-bold font-mono text-emerald-700 tabular-nums">{resolvedCount}</div>
          <span className="text-[11px] text-slate-500">Closed & verified</span>
        </div>
      </div>

      {/* Toolbar Filter */}
      <div className="bg-white rounded-md p-3.5 border border-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search feedback, assignee, notes..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:border-slate-800"
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-500 font-mono text-[11px]">Filter:</span>
          {(['ALL', 'open', 'in_progress', 'resolved'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2 py-0.5 rounded capitalize text-xs transition-colors ${
                statusFilter === st ? 'bg-slate-900 text-white font-medium' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {st === 'ALL' ? 'All' : st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-md border border-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                <th className="py-2.5 px-3.5 w-16 font-mono">ID</th>
                <th className="py-2.5 px-3.5 min-w-[280px]">Customer Statement</th>
                <th className="py-2.5 px-3.5 w-32">Category</th>
                <th className="py-2.5 px-3.5 w-24">Severity</th>
                <th className="py-2.5 px-3.5 w-32">Status</th>
                <th className="py-2.5 px-3.5 w-32">Assignee</th>
                <th className="py-2.5 px-3.5 min-w-[200px]">Notes</th>
                <th className="py-2.5 px-3.5 w-16 text-right">Edit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredIssues.slice(0, 30).map((issue) => {
                const isEditing = editingId === issue.id;

                return (
                  <tr key={issue.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3.5 font-mono text-[11px] text-slate-400">
                      {issue.id}
                    </td>
                    <td className="py-3 px-3.5">
                      <p className="text-slate-900 font-medium line-clamp-2 leading-relaxed">
                        "{issue.review}"
                      </p>
                    </td>
                    <td className="py-3 px-3.5 text-slate-700">
                      {issue.category}
                    </td>
                    <td className="py-3 px-3.5 font-mono">
                      <span className={`font-semibold ${
                        issue.severity === 'critical' ? 'text-rose-700' : issue.severity === 'high' ? 'text-amber-700' : 'text-slate-700'
                      }`}>
                        [{issue.severity.toUpperCase()}]
                      </span>
                    </td>
                    <td className="py-3 px-3.5">
                      {isEditing ? (
                        <select
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value as any)}
                          className="p-1 border border-slate-300 rounded text-xs bg-white"
                        >
                          <option value="open">Open</option>
                          <option value="in_progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      ) : (
                        <span className="font-medium capitalize text-slate-800">
                          {issue.status.replace('_', ' ')}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3.5">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editAssignee}
                          onChange={(e) => setEditAssignee(e.target.value)}
                          placeholder="Lead..."
                          className="p-1 border border-slate-300 rounded text-xs bg-white w-24"
                        />
                      ) : (
                        <span className="text-slate-600 font-mono text-[11px]">
                          {issue.assignedTo || '—'}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3.5">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          placeholder="Investigation log..."
                          className="w-full p-1 border border-slate-300 rounded text-xs bg-white"
                        />
                      ) : (
                        <span className="text-slate-600 line-clamp-1">
                          {issue.notes || '—'}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3.5 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleSaveEdit(issue)}
                            className="p-1 text-slate-800 hover:bg-slate-200 rounded"
                            title="Save"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-1 text-slate-400 hover:bg-slate-100 rounded"
                            title="Cancel"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStartEdit(issue)}
                          className="p-1 text-slate-400 hover:text-slate-900 rounded"
                          title="Edit"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="p-2.5 bg-slate-50 border-t border-slate-200 text-xs font-mono text-slate-500 text-center">
          Displaying active issues. Status and investigation notes persist across sessions.
        </div>
      </div>
    </div>
  );
};
