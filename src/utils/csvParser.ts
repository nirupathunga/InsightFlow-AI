import Papa from 'papaparse';
import { FeedbackRecord } from '../types';
import { computePriorityScore } from '../data/officialDataset';

export interface ColumnMapping {
  reviewCol: string;
  categoryCol: string;
  sourceCol?: string;
  dateCol?: string;
  customerCol?: string;
}

export interface ParseResult {
  records: FeedbackRecord[];
  headers: string[];
  detectedMapping: ColumnMapping;
  totalParsed: number;
  previewRows: Record<string, string>[];
}

export function parseFeedbackCSV(csvContent: string): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(csvContent, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const headers = results.meta.fields || [];
          if (headers.length === 0) {
            return reject(new Error('CSV file contains no header row or columns.'));
          }

          // Auto-detect best column matches
          const lowerHeaders = headers.map(h => h.trim().toLowerCase());
          
          let reviewCol = headers.find(h => {
            const l = h.toLowerCase();
            return l === 'review' || l === 'feedback' || l === 'text' || l === 'comment' || l === 'message' || l === 'description';
          }) || headers[0];

          let categoryCol = headers.find(h => {
            const l = h.toLowerCase();
            return l === 'category' || l === 'type' || l === 'topic' || l === 'department' || l === 'tag';
          }) || (headers[1] ? headers[1] : headers[0]);

          const sourceCol = headers.find(h => {
            const l = h.toLowerCase();
            return l === 'source' || l === 'channel' || l === 'platform';
          });

          const dateCol = headers.find(h => {
            const l = h.toLowerCase();
            return l === 'date' || l === 'timestamp' || l === 'created_at' || l === 'time';
          });

          const customerCol = headers.find(h => {
            const l = h.toLowerCase();
            return l === 'customer' || l === 'user' || l === 'email' || l === 'author';
          });

          const todayStr = new Date().toISOString().split('T')[0];
          const records: FeedbackRecord[] = [];

          results.data.forEach((row, idx) => {
            const reviewText = (row[reviewCol] || '').trim();
            if (!reviewText) return; // skip empty text rows

            const category = (row[categoryCol] || 'General Feedback').trim();
            const source = (sourceCol && row[sourceCol]) ? row[sourceCol].trim() : (idx % 3 === 0 ? 'Trustpilot' : idx % 2 === 0 ? 'Zendesk' : 'App Store');
            const date = (dateCol && row[dateCol]) ? row[dateCol].trim() : todayStr;
            const customer = (customerCol && row[customerCol]) ? row[customerCol].trim() : `user_${idx + 1}@domain.com`;

            // Initial deterministic scoring
            const textLower = reviewText.toLowerCase();
            let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
            let sentimentScore = 0;

            const isFraud = category === 'Fraud and Scam' || textLower.includes('scam') || textLower.includes('fraud');
            const isNegativeWord = textLower.includes('delay') || textLower.includes('unresponsive') || textLower.includes('crashing') || textLower.includes('not helpful') || textLower.includes('stopped working');
            const isPositiveWord = textLower.includes('innovative') || textLower.includes('great') || textLower.includes('helpful') || textLower.includes('excellent') || textLower.includes('love') || textLower.includes('exceeded');

            if (isFraud || isNegativeWord) {
              sentiment = 'negative';
              sentimentScore = isFraud ? -0.95 : -0.75;
            } else if (isPositiveWord) {
              sentiment = 'positive';
              sentimentScore = 0.85;
            } else {
              sentiment = 'neutral';
              sentimentScore = 0.05;
            }

            const priority = computePriorityScore(category, sentiment, reviewText);

            records.push({
              id: `fb-${idx + 1}`,
              review: reviewText,
              category,
              date,
              source,
              customer,
              sentiment,
              sentimentScore,
              priorityScore: priority.score,
              severity: priority.severity,
              status: priority.severity === 'critical' || priority.severity === 'high' ? 'open' : 'resolved',
              notes: isFraud ? 'Automatic alert: High-risk transaction detected' : undefined,
              isAiAnalyzed: false,
            });
          });

          resolve({
            records,
            headers,
            detectedMapping: {
              reviewCol,
              categoryCol,
              sourceCol,
              dateCol,
              customerCol,
            },
            totalParsed: records.length,
            previewRows: results.data.slice(0, 5),
          });
        } catch (err) {
          reject(err);
        }
      },
      error: (error: Error) => {
        reject(error);
      },
    });
  });
}

// Convert dataset to downloadable CSV string
export function exportToCSV(records: FeedbackRecord[]): string {
  const data = records.map(r => ({
    ID: r.id,
    Review: r.review,
    Category: r.category,
    Sentiment: r.sentiment,
    SentimentScore: r.sentimentScore,
    PriorityScore: r.priorityScore,
    Severity: r.severity,
    Status: r.status,
    Source: r.source,
    Date: r.date,
    Customer: r.customer || '',
    Notes: r.notes || '',
    AI_Analyzed: r.isAiAnalyzed ? 'Yes' : 'No'
  }));

  return Papa.unparse(data);
}

// Download helper utility
export function downloadFile(content: string, fileName: string, contentType: string) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
