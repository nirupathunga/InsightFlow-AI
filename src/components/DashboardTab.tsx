import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  ShieldAlert, 
  ArrowUpRight,
  FileSpreadsheet,
  Layers,
  ArrowRight
} from 'lucide-react';
import { FeedbackRecord, MetricSummary } from '../types';
import { SentimentDonutChart, CategoryBarChart, PriorityDistributionBar } from './Charts';

interface DashboardTabProps {
  records: FeedbackRecord[];
  metrics: MetricSummary;
  categoryBreakdown: { name: string; count: number }[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  selectedSentiment: string;
  onSelectSentiment: (sentiment: string) => void;
  onNavigateToTab: (tab: string) => void;
  onRunBatchAi: () => void;
  isAiRunning: boolean;
  isAiSource: boolean;
  isDemoData: boolean;
  onLoadOfficialDataset: () => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  records,
  metrics,
  categoryBreakdown,
  selectedCategory,
  onSelectCategory,
  selectedSentiment,
  onSelectSentiment,
  onNavigateToTab,
  onRunBatchAi,
  isAiRunning,
  isAiSource,
  isDemoData,
  onLoadOfficialDataset,
}) => {
  const criticalIssues = records
    .filter(r => r.severity === 'critical' || r.priorityScore >= 80)
    .slice(0, 5);

  const criticalCount = records.filter(r => r.severity === 'critical').length;
  const highCount = records.filter(r => r.severity === 'high').length;
  const mediumCount = records.filter(r => r.severity === 'medium').length;
  const lowCount = records.filter(r => r.severity === 'low').length;

  return (
    <div className="space-y-6">
      {/* Top Notice if in Demo Mode */}
      {isDemoData && (
        <div className="bg-slate-50 border border-slate-200 rounded-md p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-3">
            <div className="p-1.5 bg-slate-900 text-white rounded shrink-0 mt-0.5">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900">BuildBattle 2026 Customer Dataset</span>
                <span className="text-[11px] font-mono text-slate-500">· 600+ records available</span>
              </div>
              <p className="text-slate-600 mt-0.5 text-[11px]">
                Currently previewing 15 sample records. Load the full competition dataset to process real multi-category reviews, carrier delays, and payment disputes.
              </p>
            </div>
          </div>
          <button
            onClick={onLoadOfficialDataset}
            className="whitespace-nowrap px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded transition-colors text-xs self-stretch md:self-auto text-center"
          >
            Load Full Dataset (600+)
          </button>
        </div>
      )}

      {/* Structured Metric Ledger (Editorial / Institutional Strip) */}
      <div className="bg-white border border-slate-200 rounded-md divide-y md:divide-y-0 md:divide-x divide-slate-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        {/* Total Feedback */}
        <div className="p-4 sm:p-5 flex flex-col justify-between">
          <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
            Total Feedback Volume
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
              {metrics.total.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500">entries</span>
          </div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
            <span>Active dataset</span>
            <button
              onClick={() => onNavigateToTab('feedback')}
              className="text-slate-700 hover:text-slate-900 font-medium inline-flex items-center gap-0.5"
            >
              Browse records <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Sentiment Balance */}
        <div className="p-4 sm:p-5 flex flex-col justify-between">
          <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
            Sentiment Balance
          </div>
          <div className="my-2 flex items-baseline gap-3">
            <div className="flex items-baseline gap-1 font-mono tabular-nums">
              <span className="text-2xl sm:text-3xl font-bold text-emerald-700">
                {metrics.total > 0 ? Math.round((metrics.positive / metrics.total) * 100) : 0}%
              </span>
              <span className="text-xs text-slate-500 font-sans">pos</span>
            </div>
            <span className="text-slate-300">/</span>
            <div className="flex items-baseline gap-1 font-mono tabular-nums">
              <span className="text-xl sm:text-2xl font-bold text-rose-700">
                {metrics.total > 0 ? Math.round((metrics.negative / metrics.total) * 100) : 0}%
              </span>
              <span className="text-xs text-slate-500 font-sans">neg</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-500 font-mono tabular-nums pt-1">
            <span>{metrics.positive} Pos · {metrics.neutral} Neu · {metrics.negative} Neg</span>
          </div>
        </div>

        {/* Unresolved Grievances */}
        <div className="p-4 sm:p-5 flex flex-col justify-between">
          <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
            Open Grievances
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
              {metrics.unresolvedIssues}
            </span>
            <span className="text-xs text-amber-700 font-medium">pending resolution</span>
          </div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
            <span>Investigation queue</span>
            <button
              onClick={() => onNavigateToTab('issues')}
              className="text-slate-700 hover:text-slate-900 font-medium inline-flex items-center gap-0.5"
            >
              Action board <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Critical Alerts */}
        <div className="p-4 sm:p-5 flex flex-col justify-between">
          <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
            Critical Risk & Fraud
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-rose-700 font-mono tabular-nums">
              {metrics.criticalComplaints}
            </span>
            <span className="text-xs text-slate-500">P0 severity</span>
          </div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
            <span>Scoring &gt;= 80/100</span>
            <button
              onClick={() => onNavigateToTab('priority')}
              className="text-rose-700 hover:text-rose-800 font-medium inline-flex items-center gap-0.5"
            >
              Priority matrix <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Analytics Visualization Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Sentiment Distribution Card */}
        <div className="bg-white rounded-md p-5 border border-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Sentiment Distribution</h3>
              <p className="text-[11px] text-slate-500">Valence computed across all {records.length} loaded records</p>
            </div>
            <span className="text-[11px] font-mono text-slate-500">
              {isAiSource ? 'Gemini 3.8' : 'Deterministic'}
            </span>
          </div>

          <SentimentDonutChart
            positive={metrics.positive}
            neutral={metrics.neutral}
            negative={metrics.negative}
            total={metrics.total}
          />

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span className="text-[11px]">Filter by sentiment:</span>
            <div className="flex gap-1 font-medium text-[11px]">
              <button
                onClick={() => onSelectSentiment(selectedSentiment === 'positive' ? 'ALL' : 'positive')}
                className={`px-2 py-0.5 rounded border transition-colors ${
                  selectedSentiment === 'positive' ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Positive
              </button>
              <button
                onClick={() => onSelectSentiment(selectedSentiment === 'neutral' ? 'ALL' : 'neutral')}
                className={`px-2 py-0.5 rounded border transition-colors ${
                  selectedSentiment === 'neutral' ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Neutral
              </button>
              <button
                onClick={() => onSelectSentiment(selectedSentiment === 'negative' ? 'ALL' : 'negative')}
                className={`px-2 py-0.5 rounded border transition-colors ${
                  selectedSentiment === 'negative' ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Negative
              </button>
            </div>
          </div>
        </div>

        {/* Category Breakdown Card */}
        <div className="bg-white rounded-md p-5 border border-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Feedback Categories</h3>
              <p className="text-[11px] text-slate-500">Distribution by operational domain</p>
            </div>
            {selectedCategory !== 'ALL' && (
              <button
                onClick={() => onSelectCategory('ALL')}
                className="text-[11px] text-slate-600 hover:text-slate-900 underline font-medium"
              >
                Clear filter
              </button>
            )}
          </div>

          <CategoryBarChart
            categories={categoryBreakdown}
            total={metrics.total}
            selectedCategory={selectedCategory}
            onSelectCategory={onSelectCategory}
          />

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Primary driver: <strong className="text-slate-800">{categoryBreakdown[0]?.name || 'N/A'}</strong></span>
            <span className="font-mono">{categoryBreakdown[0]?.count || 0} items</span>
          </div>
        </div>

        {/* Priority Engine Overview Card */}
        <div className="bg-white rounded-md p-5 border border-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Risk Severity Distribution</h3>
              <p className="text-[11px] text-slate-500">Multi-factor priority classification</p>
            </div>
            <button
              onClick={() => onNavigateToTab('priority')}
              className="text-xs text-slate-700 hover:text-slate-900 font-medium inline-flex items-center gap-1"
            >
              Formula <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div className="py-2 space-y-4">
            <PriorityDistributionBar
              critical={criticalCount}
              high={highCount}
              medium={mediumCount}
              low={lowCount}
              total={metrics.total}
            />

            <div className="bg-slate-50 rounded p-3 border border-slate-200 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-800">Fraud & Financial Risk Multiplier:</span>
                <span className="text-rose-700 font-mono font-semibold">Weight 1.5x</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Prioritization algorithm scores seller fraud, chargeback risks, and delivery stalls based on regulatory exposure and customer churn impact.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 text-[11px]">Run deep analysis:</span>
            <button
              onClick={onRunBatchAi}
              disabled={isAiRunning}
              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 px-2.5 py-1 rounded font-medium transition-colors inline-flex items-center gap-1.5 disabled:opacity-50"
            >
              {isAiRunning ? 'Processing batch...' : 'Execute Gemini 3.8'}
            </button>
          </div>
        </div>
      </div>

      {/* Critical Alerts & Action Pathways */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Critical Issues Table */}
        <div className="bg-white rounded-md p-5 border border-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.03)] space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Critical Grievances Requiring Action</h3>
              <p className="text-[11px] text-slate-500">Highest priority entries based on transparent risk scoring</p>
            </div>
            <button
              onClick={() => onNavigateToTab('priority')}
              className="text-xs text-slate-700 hover:text-slate-900 font-medium"
            >
              View all ({criticalCount + highCount})
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {criticalIssues.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">No critical complaints detected.</div>
            ) : (
              criticalIssues.map((issue) => (
                <div key={issue.id} className="py-2.5 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className={`font-mono font-semibold ${
                        issue.severity === 'critical' ? 'text-rose-700' : 'text-amber-700'
                      }`}>
                        [{issue.severity.toUpperCase()} · {issue.priorityScore}/100]
                      </span>
                      <span className="text-slate-600">{issue.category}</span>
                    </div>
                    <span className="font-mono text-slate-400">{issue.source}</span>
                  </div>
                  <p className="text-xs text-slate-800 leading-relaxed font-medium">
                    "{issue.review}"
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                    <span>Status: <strong className="text-slate-700">{issue.status}</strong></span>
                    <button
                      onClick={() => onNavigateToTab('issues')}
                      className="text-slate-700 hover:text-slate-900 font-medium underline"
                    >
                      Inspect in tracker →
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Action Pathways & Operational Directives */}
        <div className="bg-white rounded-md p-5 border border-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900 text-sm">Operational Decision Framework</h3>
            <p className="text-[11px] text-slate-500">Synthesized action items based on verified customer feedback</p>
          </div>

          <div className="space-y-2.5 my-3">
            <div 
              onClick={() => onNavigateToTab('recommendations')}
              className="p-3 rounded border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-between"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs text-slate-900">Trust & Safety: Seller Verification Escrow</span>
                  <span className="text-[10px] text-rose-700 font-mono">P0 URGENT</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Address {records.filter(r => r.category === 'Fraud and Scam').length} vendor fraud reports by locking down off-platform communication.
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 ml-3" />
            </div>

            <div 
              onClick={() => onNavigateToTab('recommendations')}
              className="p-3 rounded border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-between"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs text-slate-900">Logistics: Proactive 48h Delay Webhooks</span>
                  <span className="text-[10px] text-amber-700 font-mono">P1 HIGH</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Reduce WISMO customer service backlog by automatically alerting users before carrier shipping delays breach SLA.
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 ml-3" />
            </div>

            <div 
              onClick={() => onNavigateToTab('adaption')}
              className="p-3 rounded border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-between"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs text-slate-900">Adaption Adaptive Data Pipeline</span>
                  <span className="text-[10px] text-slate-500 font-mono">EXPORT READY</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Format current feedback dataset into prompt/context/completion training records for model adaptation.
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 ml-3" />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Executive memorandum ready</span>
            <button
              onClick={() => onNavigateToTab('reports')}
              className="text-slate-800 hover:text-slate-900 font-medium inline-flex items-center gap-1"
            >
              Open Audit Report <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
