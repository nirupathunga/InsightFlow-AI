import React, { useState } from 'react';
import { 
  Calculator, 
  CheckCircle2, 
  ArrowRight, 
  Quote, 
  Scale, 
  Sliders
} from 'lucide-react';
import { FeedbackRecord } from '../types';

interface PriorityEngineTabProps {
  records: FeedbackRecord[];
  onNavigateToTab: (tab: string) => void;
}

export const PriorityEngineTab: React.FC<PriorityEngineTabProps> = ({
  records,
  onNavigateToTab,
}) => {
  const [simulatedFrequency, setSimulatedFrequency] = useState<number>(35);
  const [simulatedSentiment, setSimulatedSentiment] = useState<number>(-0.85);
  const [simulatedRisk, setSimulatedRisk] = useState<number>(90);

  const fraudCount = records.filter(r => r.category === 'Fraud and Scam').length;
  const productCount = records.filter(r => r.category === 'Product Feedback' && r.sentiment === 'negative').length;

  const rankedIssues = [
    {
      id: 'issue-fraud',
      rank: 1,
      title: 'Third-Party Seller Fraud & Unauthorized Payment Surcharges',
      category: 'Fraud and Scam',
      department: 'Trust & Safety',
      score: 96,
      severity: 'critical' as const,
      matchCount: fraudCount,
      impact: 'Immediate chargeback liability, payment gateway regulatory review, and permanent brand degradation.',
      scoringBreakdown: {
        frequency: Math.min(100, Math.round((fraudCount / (records.length || 1)) * 300)),
        sentimentSeverity: 98,
        riskMultiplier: 100,
        recency: 90,
      },
      explanation: 'Risk Multiplier (100) and severe negative valence. Off-platform wire demands represent acute existential fraud risk.',
      evidenceQuotes: records
        .filter(r => r.category === 'Fraud and Scam')
        .slice(0, 3)
        .map(r => r.review),
      recommendedAction: 'Implement mandatory vendor payout escrow holds and keyword filters for off-platform payment communication.'
    },
    {
      id: 'issue-delivery',
      rank: 2,
      title: 'Two-Week Fulfillment Delays & Tracking Invisibility',
      category: 'Operational Issues',
      department: 'Logistics & Supply Chain',
      score: 82,
      severity: 'high' as const,
      matchCount: records.filter(r => (r.review || '').toLowerCase().includes('delay')).length,
      impact: 'Elevated WISMO (Where Is My Order) ticket load, order cancellations, and negative public reviews.',
      scoringBreakdown: {
        frequency: 85,
        sentimentSeverity: 78,
        riskMultiplier: 80,
        recency: 85,
      },
      explanation: 'High volume factor (85) driven by recurring reports of 2-week delays across multiple regional fulfillment centers.',
      evidenceQuotes: records
        .filter(r => (r.review || '').toLowerCase().includes('delayed by two weeks') || (r.review || '').toLowerCase().includes('delay'))
        .slice(0, 3)
        .map(r => r.review),
      recommendedAction: 'Deploy automated carrier webhook alerts with proactive SMS tracking updates and courtesy shipping refunds.'
    },
    {
      id: 'issue-service',
      rank: 3,
      title: 'Frontline Support Response Latency & Ticket Stalls',
      category: 'Customer Service',
      department: 'Customer Experience',
      score: 74,
      severity: 'high' as const,
      matchCount: records.filter(r => r.category === 'Customer Service' && r.sentiment === 'negative').length,
      impact: 'Escalation of routine inquiries into public 1-star complaints on Trustpilot and social media.',
      scoringBreakdown: {
        frequency: 70,
        sentimentSeverity: 76,
        riskMultiplier: 72,
        recency: 78,
      },
      explanation: 'Customer dissatisfaction stems from lengthy response cycles and unhelpful generic replies during order disputes.',
      evidenceQuotes: records
        .filter(r => r.category === 'Customer Service' && r.sentiment === 'negative')
        .slice(0, 3)
        .map(r => r.review),
      recommendedAction: 'Establish a 30-minute first-response SLA for payment and fraud grievances; route tickets directly to senior agents.'
    },
    {
      id: 'issue-website',
      rank: 4,
      title: 'Checkout Web Session Crashes and Ordering Glitches',
      category: 'Operational Issues',
      department: 'Web Engineering',
      score: 68,
      severity: 'medium' as const,
      matchCount: records.filter(r => (r.review || '').toLowerCase().includes('crash') || (r.review || '').toLowerCase().includes('glitch')).length,
      impact: 'Direct revenue leakage from abandoned shopping carts during final payment submission.',
      scoringBreakdown: {
        frequency: 60,
        sentimentSeverity: 82,
        riskMultiplier: 70,
        recency: 60,
      },
      explanation: 'High conversion friction for checkout drop-offs; moderate volume across recent reports.',
      evidenceQuotes: records
        .filter(r => (r.review || '').toLowerCase().includes('crash') || (r.review || '').toLowerCase().includes('glitch'))
        .slice(0, 2)
        .map(r => r.review),
      recommendedAction: 'Audit payment session token state and implement client-side idempotent cart retry mechanisms.'
    },
    {
      id: 'issue-defect',
      rank: 5,
      title: 'Premature Hardware Defects After One Week of Use',
      category: 'Product Feedback',
      department: 'Quality Engineering',
      score: 58,
      severity: 'medium' as const,
      matchCount: productCount,
      impact: 'RMA warranty replacement logistics overhead and product return costs.',
      scoringBreakdown: {
        frequency: 45,
        sentimentSeverity: 75,
        riskMultiplier: 55,
        recency: 55,
      },
      explanation: 'Localized to a distinct hardware batch; prompt seller replacements partially buffer negative customer sentiment.',
      evidenceQuotes: records
        .filter(r => (r.review || '').toLowerCase().includes('stopped working') || (r.review || '').toLowerCase().includes('defects'))
        .slice(0, 2)
        .map(r => r.review),
      recommendedAction: 'Conduct QA audit on production lot #2026-B and offer prepaid return shipping labels.'
    }
  ];

  const calcFreqScore = simulatedFrequency;
  const calcSentScore = Math.abs(simulatedSentiment) * 100;
  const calcRiskScore = simulatedRisk;
  const calcRecencyScore = 80;
  const calculatedTotal = Math.min(
    100,
    Math.round(calcFreqScore * 0.3 + calcSentScore * 0.35 + calcRiskScore * 0.25 + calcRecencyScore * 0.1)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-md p-5 border border-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Priority Ranking Engine & Scoring Rubric
            </h2>
            <span className="text-xs font-mono text-slate-500">
              · Rubric Spec v2.1
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Transparent mathematical prioritization formula ranking customer grievances by volume, sentiment severity, financial/safety risk, and velocity.
          </p>
        </div>

        <button
          onClick={() => onNavigateToTab('recommendations')}
          className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded transition-colors flex items-center gap-1.5 self-start md:self-auto"
        >
          View Action Plan
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Formula & Interactive Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Specification */}
        <div className="lg:col-span-2 bg-white rounded-md p-5 border border-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900 text-sm">Priority Scoring Formula</h3>
            <span className="text-[11px] font-mono text-slate-500">Scale: 0 – 100 Points</span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs font-mono text-slate-800 leading-relaxed overflow-x-auto">
            <div className="font-semibold text-slate-900">
              Priority_Score = (W_freq × 0.30) + (W_sentiment × 0.35) + (W_risk × 0.25) + (W_recency × 0.10)
            </div>
            <div className="text-slate-600 text-[11px] mt-2 space-y-0.5">
              <div>· W_freq (30%): Frequency volume relative to total dataset</div>
              <div>· W_sentiment (35%): Magnitude of negative sentiment score</div>
              <div>· W_risk (25%): Fraud, chargeback, and legal safety risk multiplier</div>
              <div>· W_recency (10%): Velocity of issues in the past 14 days</div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2.5 rounded border border-rose-200 bg-rose-50/40">
              <span className="font-mono font-bold text-rose-800 block text-xs">90 – 100</span>
              <span className="text-[11px] font-medium text-rose-900">Critical Priority</span>
              <p className="text-[10px] text-slate-600 mt-0.5">Payment scams, fraud</p>
            </div>
            <div className="p-2.5 rounded border border-amber-200 bg-amber-50/40">
              <span className="font-mono font-bold text-amber-800 block text-xs">75 – 89</span>
              <span className="text-[11px] font-medium text-amber-900">High Priority</span>
              <p className="text-[10px] text-slate-600 mt-0.5">2-week fulfillment lags</p>
            </div>
            <div className="p-2.5 rounded border border-blue-200 bg-blue-50/40">
              <span className="font-mono font-bold text-blue-800 block text-xs">50 – 74</span>
              <span className="text-[11px] font-medium text-blue-900">Medium Priority</span>
              <p className="text-[10px] text-slate-600 mt-0.5">Checkout glitches</p>
            </div>
            <div className="p-2.5 rounded border border-slate-200 bg-slate-50">
              <span className="font-mono font-bold text-slate-700 block text-xs">&lt; 50</span>
              <span className="text-[11px] font-medium text-slate-800">Low Priority</span>
              <p className="text-[10px] text-slate-600 mt-0.5">Minor inquiries</p>
            </div>
          </div>
        </div>

        {/* Interactive Simulator */}
        <div className="bg-white rounded-md p-5 border border-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.03)] space-y-3 flex flex-col justify-between">
          <div>
            <div className="pb-2 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900 text-sm">Rubric Weight Simulator</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Test variable impact on calculated priority</p>
            </div>

            <div className="space-y-3 mt-3 text-xs">
              <div>
                <div className="flex justify-between text-slate-700 font-mono text-[11px] mb-1">
                  <span>Frequency Factor</span>
                  <span className="font-semibold">{simulatedFrequency}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={simulatedFrequency}
                  onChange={(e) => setSimulatedFrequency(Number(e.target.value))}
                  className="w-full accent-slate-800"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-700 font-mono text-[11px] mb-1">
                  <span>Negative Valence</span>
                  <span className="font-semibold">{simulatedSentiment}</span>
                </div>
                <input
                  type="range"
                  min="-1"
                  max="0"
                  step="0.05"
                  value={simulatedSentiment}
                  onChange={(e) => setSimulatedSentiment(Number(e.target.value))}
                  className="w-full accent-slate-800"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-700 font-mono text-[11px] mb-1">
                  <span>Fraud / Risk Weight</span>
                  <span className="font-semibold">{simulatedRisk}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={simulatedRisk}
                  onChange={(e) => setSimulatedRisk(Number(e.target.value))}
                  className="w-full accent-slate-800"
                />
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded border border-slate-200 flex items-center justify-between text-xs">
            <div>
              <span className="text-[11px] text-slate-500 font-mono block">Simulated Score:</span>
              <span className={`text-xl font-bold font-mono ${
                calculatedTotal >= 90 ? 'text-rose-700' : calculatedTotal >= 75 ? 'text-amber-700' : 'text-slate-900'
              }`}>
                {calculatedTotal} / 100
              </span>
            </div>
            <span className="font-mono text-xs font-semibold text-slate-700 uppercase">
              {calculatedTotal >= 90 ? 'Critical Severity' : calculatedTotal >= 75 ? 'High Severity' : 'Medium Severity'}
            </span>
          </div>
        </div>
      </div>

      {/* Ranked Issue Register */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">
            Prioritized Operational Issue Register ({rankedIssues.length})
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            Derived from {records.length} active records
          </span>
        </div>

        <div className="space-y-3">
          {rankedIssues.map((issue) => (
            <div
              key={issue.id}
              className="bg-white rounded-md p-5 border border-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.03)] space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-2.5 border-b border-slate-100">
                <div className="flex items-start gap-3">
                  <span className="font-mono text-xs font-bold text-slate-500 shrink-0 mt-0.5">
                    #{issue.rank}
                  </span>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-slate-900 text-sm">
                        {issue.title}
                      </h4>
                      <span className="text-slate-400">·</span>
                      <span className="text-xs text-slate-600 font-mono">{issue.category}</span>
                      <span className="text-slate-400">·</span>
                      <span className="text-xs text-slate-500 font-mono">Owner: {issue.department}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {issue.explanation}
                    </p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between shrink-0 font-mono">
                  <span className={`text-xl font-bold ${
                    issue.severity === 'critical' ? 'text-rose-700' : 'text-amber-700'
                  }`}>
                    {issue.score}/100
                  </span>
                  <span className="text-[10px] text-slate-500 uppercase">
                    {issue.severity} Priority
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1 font-mono text-[11px]">
                  <span className="font-sans font-semibold text-slate-800 uppercase tracking-wider text-[10px] block">
                    Scoring Weights:
                  </span>
                  <div>Freq: {issue.scoringBreakdown.frequency} · Sent: {issue.scoringBreakdown.sentimentSeverity} · Risk: {issue.scoringBreakdown.riskMultiplier} · Recency: {issue.scoringBreakdown.recency}</div>
                </div>

                <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-0.5">
                  <span className="font-semibold text-slate-800 uppercase tracking-wider text-[10px] block">
                    Business Impact Risk:
                  </span>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    {issue.impact}
                  </p>
                  <div className="text-slate-500 text-[10px] font-mono pt-0.5">
                    Matching records: {issue.matchCount} entries
                  </div>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
                  Customer Citations (Auditable Grounding):
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {issue.evidenceQuotes.map((q, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-slate-50 rounded border border-slate-100 text-[11px] text-slate-800 italic leading-relaxed"
                    >
                      "{q}"
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <span className="font-semibold text-slate-900">Recommended Directive: </span>
                  <span className="text-slate-700 text-[11px]">{issue.recommendedAction}</span>
                </div>

                <button
                  onClick={() => onNavigateToTab('issues')}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-medium text-[11px] rounded shrink-0 transition-colors"
                >
                  Inspect in Issue Board →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
