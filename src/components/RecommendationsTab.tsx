import React, { useState } from 'react';
import { 
  CheckSquare, 
  Square, 
  RefreshCw,
  Clock,
  ArrowRight
} from 'lucide-react';
import { RecommendationItem } from '../types';

interface RecommendationsTabProps {
  recommendations: RecommendationItem[];
  onRefreshRecommendations: () => void;
  isLoading: boolean;
  isAiSource: boolean;
  onNavigateToTab: (tab: string) => void;
}

export const RecommendationsTab: React.FC<RecommendationsTabProps> = ({
  recommendations,
  onRefreshRecommendations,
  isLoading,
  isAiSource,
  onNavigateToTab,
}) => {
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});
  const [selectedDept, setSelectedDept] = useState<string>('ALL');

  const toggleStep = (stepKey: string) => {
    setCompletedSteps(prev => ({
      ...prev,
      [stepKey]: !prev[stepKey]
    }));
  };

  const filteredRecs = selectedDept === 'ALL'
    ? recommendations
    : recommendations.filter(r => r.department === selectedDept);

  const departments = ['ALL', 'Trust & Safety / Fraud', 'Logistics & Operations', 'Customer Experience & Support', 'Product & Engineering'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-md p-5 border border-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Actionable Business Recommendations
            </h2>
            <span className="text-xs font-mono text-slate-500">
              · {isAiSource ? 'Gemini 3.8 Intelligence' : 'Evidence-Rule Engine'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational action playbooks directly grounded in verified customer feedback records.
          </p>
        </div>

        <button
          onClick={onRefreshRecommendations}
          disabled={isLoading}
          className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded transition-colors flex items-center gap-1.5 self-start md:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Synthesizing...' : 'Re-generate Recommendations'}
        </button>
      </div>

      {/* Department Filter Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-500 font-mono text-[11px] mr-1">Department:</span>
        {departments.map((dept) => (
          <button
            key={dept}
            onClick={() => setSelectedDept(dept)}
            className={`px-2.5 py-1 rounded text-xs transition-colors whitespace-nowrap ${
              selectedDept === dept
                ? 'bg-slate-900 text-white font-medium'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {dept === 'ALL' ? 'All Departments' : dept}
          </button>
        ))}
      </div>

      {/* Playbooks */}
      <div className="space-y-4">
        {filteredRecs.map((rec, recIdx) => (
          <div
            key={rec.id || `rec-${recIdx}`}
            className="bg-white rounded-md p-5 border border-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.03)] space-y-4"
          >
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1 text-xs font-mono">
                  <span className="text-slate-800 font-semibold">
                    {rec.department}
                  </span>
                  <span className="text-slate-400">·</span>
                  <span className={`font-semibold ${
                    rec.priority === 'CRITICAL' ? 'text-rose-700' : 'text-amber-700'
                  }`}>
                    [{rec.priority} PRIORITY]
                  </span>
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-500 font-sans flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    Effort: {rec.effort}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm">
                  {rec.title}
                </h3>
              </div>
            </div>

            {/* Diagnosis & Benefit */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded border border-slate-200 bg-slate-50 space-y-1">
                <strong className="text-slate-700 uppercase tracking-wider text-[10px] block">
                  Business Problem Diagnosis:
                </strong>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  {rec.description}
                </p>
              </div>

              <div className="p-3 rounded border border-slate-200 bg-slate-50 space-y-1">
                <strong className="text-slate-900 uppercase tracking-wider text-[10px] block font-semibold">
                  Expected Business Benefit (Non-Fabricated):
                </strong>
                <p className="text-slate-700 leading-relaxed text-[11px]">
                  {rec.impact}
                </p>
              </div>
            </div>

            {/* Citations */}
            <div>
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
                Representative Grounding Citations:
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {rec.evidenceQuotes.map((quote, qIdx) => (
                  <div
                    key={qIdx}
                    className="p-2 bg-slate-50 rounded border border-slate-100 text-[11px] text-slate-800 italic leading-relaxed"
                  >
                    "{quote}"
                  </div>
                ))}
              </div>
            </div>

            {/* Action Checklist */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <span className="text-xs font-semibold text-slate-800 block">
                Execution Steps:
              </span>
              <div className="space-y-1">
                {rec.actionSteps.map((step, sIdx) => {
                  const stepKey = `${rec.id}-step-${sIdx}`;
                  const isDone = Boolean(completedSteps[stepKey]);

                  return (
                    <div
                      key={sIdx}
                      onClick={() => toggleStep(stepKey)}
                      className={`p-2 rounded border text-xs flex items-center justify-between cursor-pointer transition-colors ${
                        isDone ? 'bg-slate-50 border-slate-300 text-slate-500' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {isDone ? (
                          <CheckSquare className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                        ) : (
                          <Square className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        )}
                        <span className={isDone ? 'line-through text-slate-500' : 'font-medium'}>
                          {step}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {isDone ? 'COMPLETED' : 'PENDING'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
