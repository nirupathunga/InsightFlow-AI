# InsightFlow AI — Feedback Intelligence & Business Decision Engine

Built for **Build Battle 2026** by Frontend Arena.

InsightFlow AI transforms unstructured customer reviews, surveys, and support tickets into evidence-backed business decisions using Google Gemini 3.8 Flash, deterministic risk scoring, and the Adaption Labs Adaptive Data pipeline.

---

## 🌟 Key Features

1. **Executive Dashboard**:
   - Total feedback count, positive/neutral/negative sentiment ratios, unresolved issues, and high-priority complaints computed dynamically from the active dataset.
   - Interactive SVG sentiment donut chart, category breakdown bars, and risk-weighted priority distribution.
   - Cross-filtering by category, sentiment, and source channel.

2. **Feedback Management**:
   - Native CSV parser supporting custom schemas and the official `BuildBattle_2026_Customer_Feedback_Dataset.csv` (600+ records).
   - Auto-detection of columns, missing value handling, and file upload preview.
   - Full search, filter, sort, and pagination.
   - Manual feedback submission form for real-time customer grievance entry.
   - Clear indicators distinguishing sample preview mode from live datasets.

3. **AI Analysis (Gemini 3.8 Flash)**:
   - Server-side API endpoint (`/api/analyze-batch`) using `@google/genai` with model `gemini-3.8-flash`.
   - Structured JSON schema output extracting sentiment, recurring topic clusters, complaint categories, customer pain points, and emerging trends.
   - **Zero Hallucination Guarantee**: Original feedback is preserved; every insight attaches verifiable, verbatim quotes.
   - **Deterministic Fallback Engine**: If Gemini is offline or rate-limited, a transparent local rule engine operates seamlessly, with explicit labeling of AI vs. local provenance.

4. **Transparent Priority Engine**:
   - Mathematical formula:
     $$\text{Priority Score} = (W_{\text{freq}} \times 0.30) + (W_{\text{sentiment}} \times 0.35) + (W_{\text{risk}} \times 0.25) + (W_{\text{recency}} \times 0.10)$$
   - Interactive Rubric Simulator to test how frequency, negative sentiment, and fraud risk affect urgency.
   - Critical, High, Medium, and Low severity breakdowns with evidence quotes and recommended next actions.

5. **Actionable Business Recommendations**:
   - Departmental playbooks (Trust & Safety / Fraud, Logistics & Operations, CX Support, Product Engineering).
   - Realistic impact summaries without numerical fabrications.
   - Interactive action checklist items for execution tracking.

6. **Issue Tracking & Reports**:
   - Status tracking (`Open`, `In Progress`, `Resolved`) with assignees and notes.
   - Printable Executive Memorandum (`window.print()`).
   - One-click JSON and CSV audit exports.

7. **Adaption Labs Adaptive Data Integration**:
   - In accordance with the official [Adaption documentation](https://docs.adaptionlabs.ai/tutorials/adaptive-data-app-walkthrough/):
   - Prepares unstructured customer feedback into model-ready `prompt`, `context`, and `completion` triplets for post-training / dataset adaptation.
   - Multiple training recipes: Support & Fraud Triaging, Product Defect & QA, and General Decision Engine.
   - One-click export of `Adaption_Adaptive_Data.csv`.
   - Clear API connection status verification (`/api/adaption/status`), cURL, and Python SDK snippets.

---

## 🛠 Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide React, Motion.
- **Backend**: Node.js 22, Express, `@google/genai` TypeScript SDK.
- **Data & Parsing**: PapaParse for CSV parsing/unparsing, local storage state persistence.

---

## 🔐 Environment Variables

Create a `.env` file based on `.env.example`:

```bash
# GEMINI_API_KEY: Required for live Gemini AI analysis.
# Handled server-side; never exposed to browser bundles.
GEMINI_API_KEY="your-gemini-api-key"

# ADAPTION_API_KEY: Optional key for Adaption Labs API sync.
ADAPTION_API_KEY="your-adaption-api-key"

# PORT: Server port (defaults to 3000)
PORT=3000
```

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start full-stack development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```
