import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  MessageSquareText, 
  Sparkles, 
  Scale, 
  Briefcase, 
  KanbanSquare, 
  Layers, 
  FileText, 
  Menu, 
  X, 
  Database,
  RotateCcw
} from 'lucide-react';

import { FeedbackRecord, MetricSummary, RecommendationItem } from './types';
import { SAMPLE_DEMO_DATASET } from './data/officialDataset';
import { parseFeedbackCSV } from './utils/csvParser';

import { DashboardTab } from './components/DashboardTab';
import { FeedbackTab } from './components/FeedbackTab';
import { AiAnalysisTab } from './components/AiAnalysisTab';
import { PriorityEngineTab } from './components/PriorityEngineTab';
import { RecommendationsTab } from './components/RecommendationsTab';
import { IssueTrackerTab } from './components/IssueTrackerTab';
import { AdaptionTab } from './components/AdaptionTab';
import { ReportsTab } from './components/ReportsTab';

const LOCAL_STORAGE_KEY = 'insightflow_feedback_records_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [records, setRecords] = useState<FeedbackRecord[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Could not read from localStorage:', e);
    }
    return SAMPLE_DEMO_DATASET.map(item => ({
      ...item,
      date: item.date || '2026-10-10',
      source: item.source || 'Trustpilot',
      sentiment: item.sentiment || 'neutral',
      sentimentScore: item.sentimentScore ?? 0,
      priorityScore: item.priorityScore ?? 20,
      severity: item.severity || 'low',
      status: item.status || 'open'
    }));
  });

  const [isDemoData, setIsDemoData] = useState<boolean>(() => records.length <= 20);

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedSentiment, setSelectedSentiment] = useState<string>('ALL');

  const [geminiConfigured, setGeminiConfigured] = useState(false);
  const [adaptionConfigured, setAdaptionConfigured] = useState(false);
  const [isAiRunning, setIsAiRunning] = useState(false);
  const [aiAnalysisData, setAiAnalysisData] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);

  useEffect(() => {
    try {
      const toCache = records.slice(0, 200);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(toCache));
    } catch (e) {
      console.warn('Could not save to localStorage:', e);
    }
  }, [records]);

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        setGeminiConfigured(Boolean(data.geminiConfigured));
        setAdaptionConfigured(Boolean(data.adaptionConfigured));
      })
      .catch(() => {
        setGeminiConfigured(false);
        setAdaptionConfigured(false);
      });
  }, []);

  const metrics: MetricSummary = useMemo(() => {
    const total = records.length;
    const positive = records.filter(r => r.sentiment === 'positive').length;
    const neutral = records.filter(r => r.sentiment === 'neutral').length;
    const negative = records.filter(r => r.sentiment === 'negative').length;
    const unresolvedIssues = records.filter(r => r.status === 'open' || r.status === 'in_progress').length;
    const criticalComplaints = records.filter(r => r.severity === 'critical' || r.priorityScore >= 80).length;

    const avgSentiment = total > 0
      ? Number((records.reduce((acc, curr) => acc + (curr.sentimentScore || 0), 0) / total).toFixed(2))
      : 0;

    return {
      total,
      positive,
      neutral,
      negative,
      unresolvedIssues,
      criticalComplaints,
      avgSentiment,
    };
  }, [records]);

  const categoryBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    records.forEach(r => {
      const cat = r.category || 'General';
      counts[cat] = (counts[cat] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [records]);

  const runBatchAiAnalysis = async (batchSize = 30) => {
    setIsAiRunning(true);
    try {
      const payloadItems = records.slice(0, batchSize).map(r => ({
        id: r.id,
        text: r.review,
        category: r.category,
      }));

      const res = await fetch('/api/analyze-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: payloadItems }),
      });

      const data = await res.json();
      setAiAnalysisData(data);

      if (data.analyzedFeedback && Array.isArray(data.analyzedFeedback)) {
        const scoreMap = new Map();
        data.analyzedFeedback.forEach((item: any) => {
          scoreMap.set(String(item.id), item);
        });

        setRecords(prev => prev.map(rec => {
          const match = scoreMap.get(String(rec.id));
          if (match) {
            return {
              ...rec,
              sentiment: match.sentiment || rec.sentiment,
              sentimentScore: match.sentimentScore ?? rec.sentimentScore,
              priorityScore: match.priorityScore ?? rec.priorityScore,
              severity: match.severity || rec.severity,
              isAiAnalyzed: true,
            };
          }
          return rec;
        }));
      }
    } catch (err) {
      console.error('Failed to run batch AI analysis:', err);
    } finally {
      setIsAiRunning(false);
    }
  };

  useEffect(() => {
    runBatchAiAnalysis(15);
    refreshRecommendations();
  }, []);

  const refreshRecommendations = async () => {
    setIsLoadingRecommendations(true);
    try {
      const res = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categories: categoryBreakdown.map(c => c.name),
          topics: aiAnalysisData?.recurringTopics?.map((t: any) => t.name) || [],
          sampleFeedback: records.slice(0, 10).map(r => r.review),
        }),
      });

      const data = await res.json();
      if (data.recommendations && Array.isArray(data.recommendations)) {
        setRecommendations(data.recommendations);
      }
    } catch (err) {
      console.error('Failed to refresh recommendations:', err);
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  const handleLoadOfficialDataset = async () => {
    try {
      const res = await fetch('/BuildBattle_2026_Customer_Feedback_Dataset.csv');
      const csvText = await res.text();
      const parsed = await parseFeedbackCSV(csvText);

      setRecords(parsed.records);
      setIsDemoData(false);
      setSelectedCategory('ALL');
      setSelectedSentiment('ALL');

      setTimeout(() => {
        runBatchAiAnalysis(30);
        refreshRecommendations();
      }, 100);
    } catch (err) {
      console.error('Failed to fetch official dataset:', err);
    }
  };

  const handleResetToDemo = () => {
    const initial = SAMPLE_DEMO_DATASET.map(item => ({
      ...item,
      date: item.date || '2026-10-10',
      source: item.source || 'Trustpilot',
      sentiment: item.sentiment || 'neutral',
      sentimentScore: item.sentimentScore ?? 0,
      priorityScore: item.priorityScore ?? 20,
      severity: item.severity || 'low',
      status: item.status || 'open'
    }));
    setRecords(initial);
    setIsDemoData(true);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    runBatchAiAnalysis(15);
  };

  const handleUpdateRecord = (updated: FeedbackRecord) => {
    setRecords(prev => prev.map(r => r.id === updated.id ? updated : r));
  };

  const handleAddRecord = (newRec: FeedbackRecord) => {
    setRecords(prev => [newRec, ...prev]);
  };

  const handleLoadCsvRecords = (newRecords: FeedbackRecord[]) => {
    setRecords(newRecords);
    setIsDemoData(false);
    setSelectedCategory('ALL');
    setSelectedSentiment('ALL');
    setTimeout(() => {
      runBatchAiAnalysis(30);
      refreshRecommendations();
    }, 100);
  };

  const navItems = [
    { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
    { id: 'feedback', label: 'Feedback Ledger', icon: MessageSquareText, count: records.length },
    { id: 'ai-analysis', label: 'Thematic Synthesis', icon: Sparkles },
    { id: 'priority', label: 'Priority Engine', icon: Scale },
    { id: 'recommendations', label: 'Directives & Actions', icon: Briefcase },
    { id: 'issues', label: 'Remediation Tracker', icon: KanbanSquare, count: metrics.unresolvedIssues },
    { id: 'adaption', label: 'Adaption Pipeline', icon: Layers },
    { id: 'reports', label: 'Audit Memorandum', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-slate-900 flex flex-col font-sans antialiased">
      {/* Top Institutional Header */}
      <header className="no-print sticky top-0 z-40 bg-white border-b border-slate-200 px-4 sm:px-6 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded text-slate-600 hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Clean Brand Mark */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-7 h-7 rounded bg-slate-900 flex items-center justify-center text-white font-mono font-bold text-xs tracking-wider">
              IF
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-slate-950 text-sm tracking-tight">InsightFlow</span>
                <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
                  Enterprise Feedback Intelligence
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Status Information */}
        <div className="flex items-center gap-3 text-xs">
          <div className="hidden lg:flex items-center gap-2 font-mono text-[11px] text-slate-600">
            <span className="text-slate-400">Dataset:</span>
            <span className="text-slate-900 font-medium">
              {isDemoData ? '15 sample records' : `${records.length} production records`}
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-slate-400">Engine:</span>
            <span className="text-slate-900 font-medium">
              {geminiConfigured ? 'Gemini 3.8 Flash' : 'Deterministic Rubric'}
            </span>
          </div>

          {/* Quick Dataset Switcher / Reset */}
          {isDemoData ? (
            <button
              onClick={handleLoadOfficialDataset}
              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-medium transition-colors"
            >
              Load Full Dataset (600+)
            </button>
          ) : (
            <button
              onClick={handleResetToDemo}
              className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded text-xs font-medium transition-colors inline-flex items-center gap-1"
              title="Reset to 15 Sample Records"
            >
              <RotateCcw className="w-3 h-3 text-slate-400" />
              <span>Sample Mode</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Layout Container */}
      <div className="flex-1 flex max-w-[1520px] w-full mx-auto">
        {/* Left Desktop Sidebar Navigation */}
        <aside className="no-print hidden md:flex flex-col w-56 bg-white border-r border-slate-200 py-4 px-3 space-y-4 shrink-0">
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 px-2 block mb-1">
              Modules
            </span>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded text-xs transition-colors ${
                    isActive
                      ? 'bg-slate-900 text-white font-medium shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-normal'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.count !== undefined && (
                    <span className={`text-[10px] font-mono tabular-nums ${
                      isActive ? 'text-slate-300' : 'text-slate-400'
                    }`}>
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-auto pt-3 border-t border-slate-100 text-[11px] text-slate-400 font-mono space-y-0.5 px-2">
            <div>Build Battle 2026</div>
            <div>Institutional SaaS v2.1</div>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-xs flex">
            <div className="w-64 bg-white h-full p-4 space-y-3 shadow-xl border-r border-slate-200">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-slate-900 text-xs uppercase tracking-wider font-mono">InsightFlow Modules</span>
                <button onClick={() => setMobileMenuOpen(false)}>
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>
              <div className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded text-xs ${
                        isActive ? 'bg-slate-900 text-white font-medium' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="w-3.5 h-3.5" />
                        <span>{item.label}</span>
                      </div>
                      {item.count !== undefined && (
                        <span className="text-[10px] font-mono text-slate-400">
                          {item.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-7 max-w-7xl w-full">
          {activeTab === 'dashboard' && (
            <DashboardTab
              records={records}
              metrics={metrics}
              categoryBreakdown={categoryBreakdown}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              selectedSentiment={selectedSentiment}
              onSelectSentiment={setSelectedSentiment}
              onNavigateToTab={setActiveTab}
              onRunBatchAi={() => runBatchAiAnalysis(30)}
              isAiRunning={isAiRunning}
              isAiSource={Boolean(aiAnalysisData?.isAI)}
              isDemoData={isDemoData}
              onLoadOfficialDataset={handleLoadOfficialDataset}
            />
          )}

          {activeTab === 'feedback' && (
            <FeedbackTab
              records={records}
              onUpdateRecord={handleUpdateRecord}
              onAddRecord={handleAddRecord}
              onLoadCsvRecords={handleLoadCsvRecords}
              onLoadOfficialDataset={handleLoadOfficialDataset}
              isDemoData={isDemoData}
            />
          )}

          {activeTab === 'ai-analysis' && (
            <AiAnalysisTab
              records={records}
              aiAnalysisData={aiAnalysisData}
              isAiRunning={isAiRunning}
              onRunBatchAi={runBatchAiAnalysis}
              geminiConfigured={geminiConfigured}
            />
          )}

          {activeTab === 'priority' && (
            <PriorityEngineTab
              records={records}
              onNavigateToTab={setActiveTab}
            />
          )}

          {activeTab === 'recommendations' && (
            <RecommendationsTab
              recommendations={recommendations}
              onRefreshRecommendations={refreshRecommendations}
              isLoading={isLoadingRecommendations}
              isAiSource={Boolean(aiAnalysisData?.isAI)}
              onNavigateToTab={setActiveTab}
            />
          )}

          {activeTab === 'issues' && (
            <IssueTrackerTab
              records={records}
              onUpdateRecord={handleUpdateRecord}
              onNavigateToTab={setActiveTab}
            />
          )}

          {activeTab === 'adaption' && (
            <AdaptionTab
              records={records}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsTab
              records={records}
              metrics={metrics}
              recommendations={recommendations}
              isAiSource={Boolean(aiAnalysisData?.isAI)}
            />
          )}
        </main>
      </div>
    </div>
  );
}
