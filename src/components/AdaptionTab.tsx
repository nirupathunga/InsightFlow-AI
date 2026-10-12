import React, { useState, useEffect } from 'react';
import { 
  ExternalLink, 
  Download, 
  Copy, 
  Check, 
  BookOpen
} from 'lucide-react';
import { FeedbackRecord } from '../types';
import { downloadFile } from '../utils/csvParser';
import Papa from 'papaparse';

interface AdaptionTabProps {
  records: FeedbackRecord[];
}

export const AdaptionTab: React.FC<AdaptionTabProps> = ({ records }) => {
  const [recipe, setRecipe] = useState<'support_and_fraud_triaging' | 'product_quality' | 'general_decision'>('support_and_fraud_triaging');
  const [adaptionStatus, setAdaptionStatus] = useState<{
    configured: boolean;
    service: string;
    message: string;
    documentationUrl: string;
  } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);

  useEffect(() => {
    fetch('/api/adaption/status')
      .then(res => res.json())
      .then(data => {
        setAdaptionStatus(data);
      })
      .catch(() => {
        setAdaptionStatus({
          configured: false,
          service: 'Adaption Labs Adaptive Data Platform',
          message: 'Adaption preparation workflow active (Offline / Manual Export Mode).',
          documentationUrl: 'https://docs.adaptionlabs.ai/tutorials/adaptive-data-app-walkthrough/',
        });
      });
  }, []);

  const adaptedRecords = records.map((item, index) => {
    const text = item.review || '';
    const cat = item.category || 'General';
    const textLower = text.toLowerCase();
    const isScam = cat === 'Fraud and Scam' || textLower.includes('scam') || textLower.includes('fraud');
    const isLate = textLower.includes('delay');
    const isGood = textLower.includes('innovative') || textLower.includes('great') || textLower.includes('excellent');

    let prompt = '';
    let context = '';
    let completion = '';

    if (recipe === 'support_and_fraud_triaging') {
      prompt = 'Classify customer message severity, detect policy violations, and provide immediate remediation instruction.';
      context = `Customer Review: "${text}"\nChannel: ${item.source}\nReported Category: ${cat}`;
      if (isScam) {
        completion = JSON.stringify({
          classification: 'FRAUD_CRITICAL',
          rootCause: 'Third-party seller attempting off-platform payment extortion or counterfeit delivery',
          action: 'Lock vendor account, initiate immediate buyer refund, alert Trust & Safety fraud queue',
          urgency: 'P0_IMMEDIATE'
        }, null, 2);
      } else if (isLate) {
        completion = JSON.stringify({
          classification: 'LOGISTICS_DELAY',
          rootCause: 'Carrier transit lag exceeding standard 48h fulfillment SLA',
          action: 'Send tracking resync webhook, grant 15% courtesy coupon, confirm delivery route',
          urgency: 'P1_HIGH'
        }, null, 2);
      } else if (isGood) {
        completion = JSON.stringify({
          classification: 'POSITIVE_ADVOCACY',
          rootCause: 'High product feature utility and swift customer resolution',
          action: 'Tag for customer testimonial spotlight, route satisfaction score to product engineering',
          urgency: 'P3_LOW'
        }, null, 2);
      } else {
        completion = JSON.stringify({
          classification: 'STANDARD_SUPPORT',
          rootCause: 'Customer assistance request requiring tier 1 review',
          action: 'Assign to frontline support queue with knowledge base guidance',
          urgency: 'P2_MEDIUM'
        }, null, 2);
      }
    } else if (recipe === 'product_quality') {
      prompt = 'Diagnose product defect report or feature feedback and specify engineering triage steps.';
      context = `Customer Feedback: "${text}"\nProduct Line: Core Release\nCategory: ${cat}`;
      completion = isGood
        ? 'Feature Validation: User reports high utility and ease of use. Forward to UX team as positive signal.'
        : 'Quality Alert: User experienced defect or premature failure. Flag batch serial for QA inspection.';
    } else {
      prompt = `Synthesize operational business action for customer review in category "${cat}".`;
      context = `Input: "${text}"`;
      completion = isScam
        ? 'Risk Escalate: Freeze merchant payouts and audit recent transaction logs.'
        : isLate
        ? 'Logistics Alert: Contact regional carrier depot to remediate 2-week backlog.'
        : 'Standard Operational Record: Archive for quarterly satisfaction benchmarking.';
    }

    return {
      record_id: `adaption_${item.id || index + 1}`,
      prompt,
      context,
      completion,
      source_id: String(item.id || index + 1),
      category: cat,
      feedback_length: text.length
    };
  });

  const handleExportAdaptionCsv = () => {
    const csvData = adaptedRecords.map(r => ({
      prompt: r.prompt,
      context: r.context,
      completion: r.completion,
      source_id: r.source_id,
      category: r.category,
      record_id: r.record_id,
    }));

    const csvContent = Papa.unparse(csvData);
    downloadFile(
      csvContent,
      `Adaption_Adaptive_Data_${recipe}_${new Date().toISOString().slice(0, 10)}.csv`,
      'text/csv'
    );
  };

  const pythonSnippet = `from adaption import AdaptionClient

client = AdaptionClient(api_key="YOUR_ADAPTION_API_KEY")

dataset = client.datasets.create(
    name="InsightFlow_Customer_Feedback_Triaging",
    file="Adaption_Adaptive_Data_support_and_fraud_triaging.csv",
    recipe="conversational_fine_tuning",
    columns={
        "prompt": "prompt",
        "context": "context",
        "completion": "completion"
    }
)`;

  const curlSnippet = `curl -X POST https://api.adaptionlabs.ai/v1/datasets \\
  -H "Authorization: Bearer $ADAPTION_API_KEY" \\
  -F "file=@Adaption_Adaptive_Data.csv" \\
  -F "name=insightflow_dataset" \\
  -F "recipe=adaptive_alignment"`;

  const copyToClipboard = (text: string, isCurl: boolean) => {
    navigator.clipboard.writeText(text);
    if (isCurl) {
      setCopiedCurl(true);
      setTimeout(() => setCopiedCurl(false), 2000);
    } else {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Editorial Header */}
      <div className="bg-white rounded-md p-6 border border-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.03)] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Adaption Labs Adaptive Data Pipeline
              </h2>
              <span className="text-xs font-mono text-slate-500">
                · Dataset Curation Specification
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Formats active customer feedback into supervised fine-tuning triplets (prompt, context, completion) for model adaptation and training.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://docs.adaptionlabs.ai/tutorials/adaptive-data-app-walkthrough/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 border border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded text-xs font-medium transition-colors inline-flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5 text-slate-500" />
              Adaption Documentation
              <ExternalLink className="w-3 h-3" />
            </a>

            <button
              onClick={handleExportAdaptionCsv}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-medium transition-colors inline-flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Export Adaption CSV ({adaptedRecords.length})
            </button>
          </div>
        </div>

        {/* Status Ledger */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono bg-slate-50 p-3 rounded border border-slate-200">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Integration Status:</span>
            <span className={adaptionStatus?.configured ? 'text-emerald-700 font-semibold' : 'text-slate-700 font-medium'}>
              {adaptionStatus?.configured ? 'API Connected' : 'Export & Mapping Mode (No API Key Configured)'}
            </span>
          </div>
          <span className="text-slate-400 text-[11px]">
            Target: prompt / context / completion triplet schema
          </span>
        </div>
      </div>

      {/* Recipe Selection & Transformation Console */}
      <div className="bg-white rounded-md p-5 border border-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.03)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
          <div>
            <h3 className="font-semibold text-slate-900 text-sm">Target Adaptation Recipe</h3>
            <p className="text-[11px] text-slate-500">Select formatting recipe according to downstream model task</p>
          </div>

          <div className="flex gap-1 text-xs">
            <button
              onClick={() => setRecipe('support_and_fraud_triaging')}
              className={`px-2.5 py-1 rounded transition-colors ${
                recipe === 'support_and_fraud_triaging'
                  ? 'bg-slate-900 text-white font-medium'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              Support & Fraud Triaging
            </button>
            <button
              onClick={() => setRecipe('product_quality')}
              className={`px-2.5 py-1 rounded transition-colors ${
                recipe === 'product_quality'
                  ? 'bg-slate-900 text-white font-medium'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              Product Defect & QA
            </button>
            <button
              onClick={() => setRecipe('general_decision')}
              className={`px-2.5 py-1 rounded transition-colors ${
                recipe === 'general_decision'
                  ? 'bg-slate-900 text-white font-medium'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              General Decision Engine
            </button>
          </div>
        </div>

        {/* Live Transformation Preview */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>Sample Transformed Records (First 4 of {adaptedRecords.length})</span>
            <span>Schema: record_id, prompt, context, completion</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {adaptedRecords.slice(0, 4).map((rec) => (
              <div
                key={rec.record_id}
                className="p-3.5 rounded border border-slate-200 bg-white space-y-2 text-xs"
              >
                <div className="flex items-center justify-between pb-1 border-b border-slate-100 font-mono text-[11px]">
                  <span className="font-bold text-slate-900">{rec.record_id}</span>
                  <span className="text-slate-500">Category: {rec.category}</span>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block">Prompt:</span>
                  <p className="text-slate-800 text-[11px] font-sans leading-relaxed">
                    {rec.prompt}
                  </p>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block">Context:</span>
                  <p className="text-slate-700 text-[11px] bg-slate-50 p-2 rounded border border-slate-100 font-sans leading-relaxed">
                    {rec.context}
                  </p>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-mono text-slate-700 block font-semibold">Target Completion:</span>
                  <pre className="text-[11px] bg-slate-900 text-emerald-400 p-2 rounded overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed">
                    {rec.completion}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Guide & Code Blocks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Step-by-Step Guide */}
        <div className="bg-white rounded-md p-5 border border-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.03)] space-y-3">
          <h3 className="font-semibold text-slate-900 text-sm">
            Adaption Platform Ingestion Instructions
          </h3>

          <div className="space-y-2.5 text-xs text-slate-600">
            <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
              <span className="font-mono text-slate-900 font-bold block mb-0.5">01. Export Dataset</span>
              <span>Click "Export Adaption CSV" to download the formatted triplet dataset.</span>
            </div>

            <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
              <span className="font-mono text-slate-900 font-bold block mb-0.5">02. Upload to Adaption Labs</span>
              <span>In your Adaption workspace, create a new Adaptive Data project and upload the CSV.</span>
            </div>

            <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
              <span className="font-mono text-slate-900 font-bold block mb-0.5">03. Map Columns</span>
              <span>Verify that columns map 1:1 to <code>prompt</code>, <code>context</code>, and <code>completion</code>.</span>
            </div>

            <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
              <span className="font-mono text-slate-900 font-bold block mb-0.5">04. Trigger Post-Training</span>
              <span>Apply curation recipes and export the adapted model weights or fine-tuned checkpoint.</span>
            </div>
          </div>
        </div>

        {/* Integration Code */}
        <div className="bg-white rounded-md p-5 border border-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.03)] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900 text-sm">Programmatic API Snippets</h3>
            <span className="text-[11px] text-slate-400 font-mono">Python / cURL</span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                <span className="font-mono text-[11px]">Python SDK</span>
                <button
                  onClick={() => copyToClipboard(pythonSnippet, false)}
                  className="text-slate-700 hover:text-slate-900 flex items-center gap-1 text-[11px] font-mono underline"
                >
                  {copiedCode ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  {copiedCode ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="p-2.5 bg-slate-900 text-slate-100 rounded text-[11px] font-mono overflow-x-auto">
                {pythonSnippet}
              </pre>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                <span className="font-mono text-[11px]">cURL Command</span>
                <button
                  onClick={() => copyToClipboard(curlSnippet, true)}
                  className="text-slate-700 hover:text-slate-900 flex items-center gap-1 text-[11px] font-mono underline"
                >
                  {copiedCurl ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  {copiedCurl ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="p-2.5 bg-slate-900 text-emerald-400 rounded text-[11px] font-mono overflow-x-auto">
                {curlSnippet}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
