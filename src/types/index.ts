export type SentimentType = 'positive' | 'neutral' | 'negative';
export type SeverityType = 'low' | 'medium' | 'high' | 'critical';
export type IssueStatus = 'open' | 'in_progress' | 'resolved';

export interface FeedbackRecord {
  id: string;
  review: string;
  category: string;
  date: string;
  source: string;
  customer?: string;
  sentiment: SentimentType;
  sentimentScore: number; // -1.0 to 1.0
  priorityScore: number;  // 1 to 100
  severity: SeverityType;
  status: IssueStatus;
  notes?: string;
  assignedTo?: string;
  isAiAnalyzed?: boolean;
}

export interface MetricSummary {
  total: number;
  positive: number;
  neutral: number;
  negative: number;
  unresolvedIssues: number;
  criticalComplaints: number;
  avgSentiment: number;
}

export interface TopicCluster {
  id: string;
  name: string;
  category: string;
  frequency: number;
  sentiment: SentimentType;
  priorityScore: number;
  representativeQuotes: string[];
}

export interface RecommendationItem {
  id: string;
  department: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  evidenceQuotes: string[];
  impact: string;
  effort: string;
  actionSteps: string[];
}

export interface AdaptionPreparedRecord {
  record_id: string;
  prompt: string;
  context: string;
  completion: string;
  source_id: string;
  category: string;
  feedback_length: number;
}
