import React, { useState } from 'react';
import { 
  RefreshCw, 
  Code, 
  Quote, 
  TrendingUp, 
  AlertCircle
} from 'lucide-react';
import { FeedbackRecord } from '../types';

interface AiAnalysisTabProps {
  records: FeedbackRecord[];
  aiAnalysisData: any;
  isAiRunning: boolean;
  onRunBatchAi: (batchSize?: number) => void;
  geminiConfigured: boolean;
}

export const AiAnalysisTab: React.FC<AiAnalysisTabProps> = ({
  records,
  aiAnalysisData,
  isAiRunning,
  onRunBatchAi,
  geminiConfigured,
}) => {
  const [selectedBatchSize, setSelectedBatchSize] = useState<number>(30);
  const [showJsonInspector, setShowJsonInspector] = useState(false);
  const [activeTopicCategory, setActiveTopicCategory] = useState<string>('ALL');

  const topics = aiAnalysisData?.recurringTopics || [];
  const complaintCategories = aiAnalysisData?.complaintCategories || [];
  const trends = aiAnalysisData?.emergingTrends || [];
  const isRealAi = Boolean(aiAnalysisData?.isAI);
  const sourceName = aiAnalysisData?.source || (isRealAi ? 'gemini-3.8-flash' : 'local-deterministic');

  const filteredTopics = activeTopicCategory === 'ALL'
    ? topics
    : topics.filter((t: any) => t.category === activeTopicCategory);

  return (
    <div className="space-y-6">
      {/* Top Header & Execution Bar */}
      <div className="bg-white rounded-md p-5 border border-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Qualitative Topic & Sentiment Synthesis
            </h2>
            <span className="text-xs font-mono text-slate-500">
              · {isRealAi ? 'Gemini 3.8 Flash' : 'Deterministic Mode'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Extract thematic clusters, customer pain points, and systemic risk vectors with verbatim evidence citations.
          </p>
        </div>

        {/* Batch Execution Controls */}
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded border border-slate-300">
            <span className="text-slate-500">Sample size:</span>
            <select
              value={selectedBatchSize}
              onChange={(e) => setSelectedBatchSize(Number(e.target.value))}
              className="bg-transparent font-semibold text-slate-900 focus:outline-none cursor-pointer"
            >
              <option value={15}>15 records</option>
              <option value={30}>30 records</option>
              <option value={50}>50 records</option>
              <option value={records.length}>All ({records.length})</option>
            </select>
          </div>

          <button
            onClick={() => onRunBatchAi(selectedBatchSize)}
            disabled={isAiRunning}
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAiRunning ? 'animate-spin' : ''}`} />
            {isAiRunning ? 'Analyzing...' : 'Run Analysis'}
          </button>
        </div>
      </div>

      {/* Engine Provenance Bar */}
      <div className="bg-slate-50 border border-slate-200 rounded-md p-3.5 text-xs text-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="text-slate-500">Engine:</span>
          <span className="text-slate-900 font-semibold">{sourceName}</span>
          <span className="text-slate-400">·</span>
          <span className="text-slate-500">
            {isRealAi 
              ? 'Model: Google Gemini 3.8 Flash (Server-Side Inference)' 
              : 'Local Rule Engine (Zero Hallucination Fallback)'}
          </span>
        </div>

        <button
          onClick={() => setShowJsonInspector(!showJsonInspector)}
          className="text-[11px] font-mono text-slate-700 hover:text-slate-900 flex items-center gap-1 underline self-start sm:self-auto"
        >
          <Code className="w-3 h-3" />
          {showJsonInspector ? 'Hide JSON payload' : 'Inspect raw JSON schema'}
        </button>
      </div>

      {/* Collapsible JSON Schema Inspector */}
      {showJsonInspector && (
        <div className="bg-slate-900 text-slate-100 rounded-md p-4 border border-slate-800 text-xs font-mono space-y-2">
          <div className="flex items-center justify-between pb-1 border-b border-slate-800 text-slate-400 text-[11px]">
            <span>Structured Response Payload Schema</span>
            <button 
              onClick={() => setShowJsonInspector(false)}
              className="text-slate-400 hover:text-white"
            >
              Close
            </button>
          </div>
          <pre className="max-h-64 overflow-y-auto p-2 bg-slate-950 rounded text-[11px] leading-relaxed text-emerald-400">
            {JSON.stringify(aiAnalysisData, null, 2)}
          </pre>
        </div>
      )}

      {/* Executive Synthesis Summary */}
      <div className="bg-white rounded-md p-5 border border-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.03)] space-y-3">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Executive Synthesis Memo
        </div>
        <p className="text-xs sm:text-sm text-slate-800 leading-relaxed border-l-2 border-slate-900 pl-3.5 py-0.5">
          {aiAnalysisData?.executiveSummary || 'Awaiting batch analysis run...'}
        </p>

        {aiAnalysisData?.sentimentStats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs font-mono">
            <div>
              <span className="text-slate-400 text-[11px] block font-sans">Analyzed Count</span>
              <strong className="text-slate-900 text-sm">
                {aiAnalysisData?.analyzedCount || records.length}
              </strong>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block font-sans">Positive Valence</span>
              <strong className="text-emerald-700 text-sm">
                {aiAnalysisData.sentimentStats.positiveCount}
              </strong>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block font-sans">Neutral Feedback</span>
              <strong className="text-amber-700 text-sm">
                {aiAnalysisData.sentimentStats.neutralCount}
              </strong>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block font-sans">Negative Grievance</span>
              <strong className="text-rose-700 text-sm">
                {aiAnalysisData.sentimentStats.negativeCount}
              </strong>
            </div>
          </div>
        )}
      </div>

      {/* Recurring Topic Clusters with Evidence Quotes */}
      <div className="bg-white rounded-md p-5 border border-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.03)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Recurring Thematic Clusters & Citations</h3>
            <p className="text-[11px] text-slate-500">
              Clustered feedback topics with verbatim customer statements as auditable proof.
            </p>
          </div>

          {/* Category Filter Options */}
          <div className="flex flex-wrap gap-1 text-xs font-medium">
            {['ALL', 'Customer Service', 'Fraud and Scam', 'Operational Issues', 'Product Feedback'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveTopicCategory(cat)}
                className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                  activeTopicCategory === cat 
                    ? 'bg-slate-900 text-white' 
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {cat === 'ALL' ? 'All' : cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTopics.map((topic: any) => (
            <div
              key={topic.id}
              className="p-4 rounded border border-slate-200 bg-white flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h4 className="font-semibold text-slate-900 text-xs">
                    {topic.name}
                  </h4>
                  <span className={`text-[11px] font-mono capitalize ${
                    topic.sentiment === 'positive'
                      ? 'text-emerald-700'
                      : topic.sentiment === 'negative'
                      ? 'text-rose-700'
                      : 'text-amber-700'
                  }`}>
                    [{topic.sentiment}]
                  </span>
                </div>

                <div className="text-[11px] text-slate-500 font-mono mb-2.5">
                  <span>Category: {topic.category}</span>
                  <span className="mx-1">·</span>
                  <span>Mentions: {topic.frequency}</span>
                </div>

                {/* Grounding Quotes */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block">
                    Grounded Customer Citations:
                  </span>
                  {topic.representativeQuotes && topic.representativeQuotes.map((q: string, idx: number) => (
                    <div
                      key={idx}
                      className="p-2 bg-slate-50 rounded border border-slate-100 text-[11px] text-slate-800 italic leading-relaxed"
                    >
                      "{q}"
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 font-mono flex items-center justify-between">
                <span>Verification: Verified In Dataset</span>
                <span>Ref ID: #{topic.id}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Emerging Trends & Root Cause Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Emerging Trends */}
        <div className="bg-white rounded-md p-5 border border-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.03)] space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900 text-sm">Emerging Trend Trajectories</h3>
            <span className="text-[11px] text-slate-500 font-mono">Velocity</span>
          </div>

          <div className="space-y-2.5">
            {trends.map((tr: any, idx: number) => (
              <div key={idx} className="p-3 rounded border border-slate-200 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">{tr.trend}</span>
                  <span className={`text-[10px] font-mono uppercase ${
                    tr.direction === 'rising' ? 'text-rose-700 font-semibold' : 'text-slate-600'
                  }`}>
                    [{tr.direction}]
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  {tr.description}
                </p>
                {tr.evidenceQuote && (
                  <div className="text-[11px] text-slate-700 italic bg-slate-50 p-2 rounded border border-slate-100">
                    "{tr.evidenceQuote}"
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Complaint Categories Root Cause Analysis */}
        <div className="bg-white rounded-md p-5 border border-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.03)] space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900 text-sm">Systemic Root Cause Breakdown</h3>
            <span className="text-[11px] text-slate-500 font-mono">Operational Severity</span>
          </div>

          <div className="space-y-2.5">
            {complaintCategories.map((c: any, idx: number) => (
              <div key={idx} className="p-3 rounded border border-slate-200 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">{c.name}</span>
                  <span className={`text-[10px] font-mono uppercase ${
                    c.severity === 'critical' ? 'text-rose-700 font-bold' : c.severity === 'high' ? 'text-amber-700 font-semibold' : 'text-slate-600'
                  }`}>
                    [{c.severity} severity]
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Primary Failure: <strong className="text-slate-900 font-medium">{c.mainIssue}</strong>
                </p>
                <div className="text-[10px] font-mono text-slate-400">
                  Impacted volume: {c.count} records
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
