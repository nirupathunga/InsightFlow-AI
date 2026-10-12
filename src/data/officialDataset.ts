export interface FeedbackItem {
  id: string;
  review: string;
  category: string;
  date?: string;
  source?: string;
  customer?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  sentimentScore?: number;
  priorityScore?: number;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  status?: 'open' | 'in_progress' | 'resolved';
  notes?: string;
  assignedTo?: string;
  isAiAnalyzed?: boolean;
}

// Curated 15-item diverse sample demo dataset for clean first-launch discovery
export const SAMPLE_DEMO_DATASET: FeedbackItem[] = [
  {
    id: "fb-sample-01",
    review: "The product's innovative features have greatly improved my daily tasks.",
    category: "Product Feedback",
    date: "2026-10-10",
    source: "Trustpilot",
    customer: "sarah.jenkins@company.com",
    sentiment: "positive",
    sentimentScore: 0.92,
    priorityScore: 22,
    severity: "low",
    status: "resolved",
    assignedTo: "Product Team"
  },
  {
    id: "fb-sample-02",
    review: "Customer service was unresponsive to my inquiry. I'm disappointed with the experience.",
    category: "Customer Service",
    date: "2026-10-09",
    source: "Zendesk",
    customer: "marcus.v@provider.net",
    sentiment: "negative",
    sentimentScore: -0.74,
    priorityScore: 68,
    severity: "high",
    status: "in_progress",
    assignedTo: "CX Lead",
    notes: "Followed up with ticket #4402 - customer awaiting replacement confirmation"
  },
  {
    id: "fb-sample-03",
    review: "I was a victim of fraud, the seller requested additional payment after purchase.",
    category: "Fraud and Scam",
    date: "2026-10-08",
    source: "App Store",
    customer: "elena.rostova@gmail.com",
    sentiment: "negative",
    sentimentScore: -0.98,
    priorityScore: 98,
    severity: "critical",
    status: "open",
    assignedTo: "Trust & Safety",
    notes: "Urgent: Seller vendor ID flagged for immediate merchant lockout"
  },
  {
    id: "fb-sample-04",
    review: "The delivery was delayed due to unforeseen circumstances, but I was informed promptly.",
    category: "Operational Issues",
    date: "2026-10-07",
    source: "Customer Survey",
    customer: "d_kimura@acme.org",
    sentiment: "neutral",
    sentimentScore: 0.15,
    priorityScore: 42,
    severity: "medium",
    status: "resolved",
    assignedTo: "Logistics"
  },
  {
    id: "fb-sample-05",
    review: "The product arrived with some defects, but the seller was responsive and provided a replacement.",
    category: "Product Feedback",
    date: "2026-10-06",
    source: "Trustpilot",
    customer: "alex.t@outlook.com",
    sentiment: "neutral",
    sentimentScore: 0.28,
    priorityScore: 50,
    severity: "medium",
    status: "resolved",
    assignedTo: "Support"
  },
  {
    id: "fb-sample-06",
    review: "Customer service was incredibly helpful and resolved my issue within minutes.",
    category: "Customer Service",
    date: "2026-10-05",
    source: "Live Chat",
    customer: "priya.patel@techfirm.co",
    sentiment: "positive",
    sentimentScore: 0.95,
    priorityScore: 18,
    severity: "low",
    status: "resolved",
    assignedTo: "Frontline Agent"
  },
  {
    id: "fb-sample-07",
    review: "I was scammed by a fraudulent seller, they took my money and never sent the product.",
    category: "Fraud and Scam",
    date: "2026-10-04",
    source: "Direct Support",
    customer: "lucas.m@mail.de",
    sentiment: "negative",
    sentimentScore: -0.99,
    priorityScore: 99,
    severity: "critical",
    status: "open",
    assignedTo: "Trust & Safety",
    notes: "Escalated for immediate chargeback reversal and fraud investigation"
  },
  {
    id: "fb-sample-08",
    review: "I faced several issues while placing my order on the website, it kept crashing.",
    category: "Operational Issues",
    date: "2026-10-04",
    source: "Web Analytics Intercept",
    customer: "anonymous_buyer_89@domain.com",
    sentiment: "negative",
    sentimentScore: -0.81,
    priorityScore: 76,
    severity: "high",
    status: "in_progress",
    assignedTo: "Web Engineering"
  },
  {
    id: "fb-sample-09",
    review: "The product exceeded my expectations in terms of quality and performance.",
    category: "Product Feedback",
    date: "2026-10-03",
    source: "Trustpilot",
    customer: "claire.bennett@enterprise.com",
    sentiment: "positive",
    sentimentScore: 0.94,
    priorityScore: 15,
    severity: "low",
    status: "resolved",
    assignedTo: "Marketing"
  },
  {
    id: "fb-sample-10",
    review: "I suspect fraudulent activity as I was charged multiple times for a single purchase.",
    category: "Fraud and Scam",
    date: "2026-10-02",
    source: "Zendesk",
    customer: "j_miller@gmail.com",
    sentiment: "negative",
    sentimentScore: -0.92,
    priorityScore: 92,
    severity: "critical",
    status: "open",
    assignedTo: "Finance & Risk"
  },
  {
    id: "fb-sample-11",
    review: "The delivery was delayed by two weeks, which was very inconvenient.",
    category: "Operational Issues",
    date: "2026-10-02",
    source: "Customer Survey",
    customer: "rachel.green@nyc.rr.com",
    sentiment: "negative",
    sentimentScore: -0.79,
    priorityScore: 71,
    severity: "high",
    status: "open",
    assignedTo: "Logistics"
  },
  {
    id: "fb-sample-12",
    review: "Great value for money. The product performs very well and is worth the price.",
    category: "Product Feedback",
    date: "2026-10-01",
    source: "Trustpilot",
    customer: "omar.h@dubai.ae",
    sentiment: "positive",
    sentimentScore: 0.88,
    priorityScore: 20,
    severity: "low",
    status: "resolved",
    assignedTo: "Product Team"
  },
  {
    id: "fb-sample-13",
    review: "There were glitches on the website, making it difficult to complete my purchase.",
    category: "Operational Issues",
    date: "2026-09-30",
    source: "Web Feedback",
    customer: "hannah.k@yahoo.com",
    sentiment: "negative",
    sentimentScore: -0.65,
    priorityScore: 62,
    severity: "medium",
    status: "in_progress",
    assignedTo: "Frontend Engineering"
  },
  {
    id: "fb-sample-14",
    review: "Customer service was knowledgeable and provided excellent assistance throughout the purchasing process.",
    category: "Customer Service",
    date: "2026-09-29",
    source: "Zendesk",
    customer: "victor.s@techgroup.io",
    sentiment: "positive",
    sentimentScore: 0.91,
    priorityScore: 16,
    severity: "low",
    status: "resolved",
    assignedTo: "CX Lead"
  },
  {
    id: "fb-sample-15",
    review: "Unfortunately, the product did not meet my expectations. It stopped working after a week.",
    category: "Product Feedback",
    date: "2026-09-28",
    source: "Warranty Claim",
    customer: "d_garcia@hotmail.com",
    sentiment: "negative",
    sentimentScore: -0.84,
    priorityScore: 78,
    severity: "high",
    status: "open",
    assignedTo: "QA Hardware"
  }
];

// Helper to calculate priority score based on transparent rubric
export function computePriorityScore(
  category: string,
  sentiment: 'positive' | 'neutral' | 'negative',
  text: string
): { score: number; severity: 'low' | 'medium' | 'high' | 'critical'; rubric: string } {
  const textLower = text.toLowerCase();
  const isFraud = category === 'Fraud and Scam' || textLower.includes('fraud') || textLower.includes('scam') || textLower.includes('charged multiple');
  const isSevereOperational = textLower.includes('crashing') || textLower.includes('two weeks') || textLower.includes('stopped working');
  const isUnresponsive = textLower.includes('unresponsive') || textLower.includes('not helpful');

  let baseScore = 20;
  let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
  let rubric = 'Standard routine feedback';

  if (isFraud) {
    baseScore = 95;
    severity = 'critical';
    rubric = 'Fraud & Financial Risk Multiplier: High legal & chargeback exposure (+75)';
  } else if (sentiment === 'negative') {
    if (isSevereOperational) {
      baseScore = 80;
      severity = 'high';
      rubric = 'Severe Operational Failure: Churn driver with widespread impact (+60)';
    } else if (isUnresponsive) {
      baseScore = 68;
      severity = 'high';
      rubric = 'Customer Frustration: High SLA breach on support channels (+48)';
    } else {
      baseScore = 55;
      severity = 'medium';
      rubric = 'Moderate Negative Sentiment: Requires standard team review (+35)';
    }
  } else if (sentiment === 'neutral') {
    baseScore = 38;
    severity = 'medium';
    rubric = 'Neutral experience: Monitor for potential negative drift (+18)';
  } else {
    baseScore = 15;
    severity = 'low';
    rubric = 'Positive endorsement: Low urgency, highlight for advocacy (+0)';
  }

  return { score: baseScore, severity, rubric };
}
