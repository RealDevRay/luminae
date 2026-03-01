<p align="center">
  <img src="apps/web/public/luminae-logo.png" alt="Luminae" width="120" />
</p>

<h1 align="center">Luminae</h1>

<p align="center">
  <strong>Autonomous Research Illumination System</strong><br/>
  Transform academic papers into actionable intelligence with a multi-agent AI pipeline
</p>

<p align="center">
  <a href="#demo">📺 Demo</a> •
  <a href="#features">✨ Features</a> •
  <a href="#architecture">🏗️ Architecture</a> •
  <a href="#models">🤖 Models</a> •
  <a href="#agents">🧠 AI Agents</a> •
  <a href="#getting-started">🚀 Getting Started</a>
</p>

---

## 🏆 Mistral AI Hackathon — Mistral Vibe Track

> **Track**: _Anything Goes — Use any Mistral model to create the best project_

Luminae is built for the **Mistral Vibe** hackathon track, showcasing what's possible when you orchestrate multiple Mistral models into a unified research analysis platform. We use **5 specialized AI agents** powered by **Ministrals (3B/8B)** and **Mistral OCR** to deliver deep paper analysis at just ~$0.05 per paper — all within a $15 budget.

## <a name="demo"></a>📺 Demo

> **YouTube Demo (2 min)**: _[Link will be added]_

## <a name="features"></a>✨ What Luminae Does

Upload any academic paper (or paste a URL) and Luminae's AI agents deliver:

| Feature                     | What You Get                                                                      |
| --------------------------- | --------------------------------------------------------------------------------- |
| 🔍 **OCR & Extraction**     | Full text, figures, and tables extracted from PDFs, DOCX, PPTX, and images        |
| 🧬 **Methodology Critique** | Design flaws, statistical power issues, reproducibility gaps — severity-rated     |
| 📊 **Dataset Audit**        | Bias detection, missing data assessment, representation analysis                  |
| 🧪 **Experiment Design**    | 3 follow-up experiments with hypotheses, methods, feasibility scores, and budgets |
| 📝 **Grant Proposal**       | NSF-style grant outline with specific aims, research strategy, and timeline       |
| 💡 **Synthesis**            | Cross-agent insights that would surprise the original authors                     |
| 💰 **Cost Tracking**        | Real-time budget monitoring with per-paper cost breakdown                         |
| 🔗 **URL Input**            | Paste any public document URL — no upload needed                                  |
| 💬 **Built-in Assistant**   | FAQ chatbot for platform guidance                                                 |

### Supported Document Formats

| Method          | Formats                                               |
| --------------- | ----------------------------------------------------- |
| **File Upload** | PDF, DOCX, PPTX, PNG, JPG, AVIF, WebP                 |
| **URL Input**   | Any public URL to the above formats (e.g. arXiv PDFs) |

## <a name="architecture"></a>🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    LUMINAE ARCHITECTURE                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌──────────────┐         ┌──────────────────────────┐     │
│   │  Next.js 16  │ ──API── │  FastAPI (Python 3.11)   │     │
│   │  Frontend    │         │  Backend                  │     │
│   │  (Vercel)    │         │  (Render)                 │     │
│   └──────────────┘         └──────────┬───────────────┘     │
│                                       │                      │
│                          ┌────────────┴────────────┐        │
│                          │   Agent Orchestrator     │        │
│                          └────────────┬────────────┘        │
│                                       │                      │
│           ┌───────────────────────────┼──────────┐          │
│           ▼                           ▼          ▼          │
│   ┌──────────────┐  ┌────────────────────────────────┐     │
│   │  Mistral OCR │  │      5 Reasoning Agents         │     │
│   │  (Step 1)    │  │  ┌─────────┐ ┌──────────┐      │     │
│   └──────┬───────┘  │  │Method.  │ │ Dataset  │      │     │
│          │          │  │ Critic  │ │ Auditor  │      │     │
│          ▼          │  └────┬────┘ └────┬─────┘      │     │
│   ┌──────────────┐  │       └────┬──────┘            │     │
│   │ Vision (3B)  │  │            ▼                    │     │
│   │  (Step 2)    │  │  ┌──────────────┐              │     │
│   └──────────────┘  │  │  Experiment  │              │     │
│                     │  │  Designer    │              │     │
│                     │  └──────┬───────┘              │     │
│                     │         ▼                       │     │
│                     │  ┌───────────┐ ┌────────────┐  │     │
│                     │  │ Synthesis │ │   Grant    │  │     │
│                     │  │   Agent   │ │ Generator  │  │     │
│                     │  └───────────┘ └────────────┘  │     │
│                     └────────────────────────────────┘     │
│                                                              │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│   │  Supabase    │  │    Redis     │  │   Budget     │     │
│   │  (Auth + DB) │  │  (Tracking)  │  │  Protection  │     │
│   └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Processing Pipeline** (Steps 2a/2b/2c run in parallel via `asyncio.gather`):

```
Step 1: OCR  →  Step 2a: Vision Analysis     ┐
                Step 2b: Methodology Critique  ├→  Step 3: Experiments  →  Step 4: Synthesis  →  Step 5: Grant
                Step 2c: Dataset Audit        ┘
```

## <a name="models"></a>🤖 Mistral Models Used

| Model                    | Purpose                              | Why This Model                                                      |
| ------------------------ | ------------------------------------ | ------------------------------------------------------------------- |
| **`mistral-ocr-latest`** | Document OCR — text, figures, tables | Best-in-class document understanding                                |
| **`ministral-3b-2512`**  | Figure/vision analysis               | Ultra-fast, cost-efficient for image tasks                          |
| **`ministral-8b-2512`**  | All 5 reasoning agents               | Optimal balance of intelligence and cost for structured JSON output |

> All models are from the **recommended Ministrals family** for the hackathon. We chose cost-optimized models to maximize the number of papers we can analyze within the $15 budget.

**Cost per paper**: ~$0.05 → **~300 papers** possible on a $15 budget

## <a name="agents"></a>🧠 AI Agents

Luminae uses **5 specialized AI agents**, each with a unique persona and expertise:

| Agent                      | Persona                                      | Role                                                                                       |
| -------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------ |
| 🔬 **Methodology Critic**  | Dr. Elena Vasquez — 20yr peer review veteran | Identifies design flaws, statistical power issues, reproducibility gaps, validity threats  |
| 📊 **Dataset Auditor**     | Dr. James Chen — Data governance expert      | Audits dataset size, bias sources, missing data handling, ethical concerns, representation |
| 🧪 **Experiment Designer** | Dr. Sarah Okonkwo — Creative experimentalist | Designs 3 bold follow-up experiments with hypotheses, methods, feasibility scores          |
| 🔗 **Synthesis Agent**     | Cross-agent synthesizer                      | Resolves conflicts between agents, generates 3 surprising key insights                     |
| 📝 **Grant Generator**     | NSF proposal specialist                      | Creates complete grant outline: specific aims, research strategy, timeline, budget         |

Each agent outputs **strict JSON** for structured, parseable results displayed in a tabbed dashboard.

## <a name="getting-started"></a>🚀 Getting Started

### Prerequisites

- Node.js 18+ & pnpm
- Python 3.11+
- Mistral API key ([get one here](https://console.mistral.ai/))
- Supabase project ([create one](https://supabase.com))

### Quick Start

```bash
# Clone
git clone https://github.com/RealDevRay/luminae.git
cd luminae

# Install dependencies
pnpm install
cd apps/api && pip install -r requirements.txt && cd ../..

# Set up environment
cp .env.example .env
# Add your LUMINAE_MISTRAL_API_KEY, Supabase keys, etc.

# Run the database schema
# Paste schema.sql into your Supabase SQL editor

# Start development
pnpm dev              # Frontend on :3000
cd apps/api && uvicorn src.main:app --reload  # API on :8000
```

### Docker (Local Dev)

```bash
docker-compose -f infra/docker-compose.yml up
```

### Environment Variables

| Variable                           | Required | Description               |
| ---------------------------------- | -------- | ------------------------- |
| `LUMINAE_MISTRAL_API_KEY`          | ✅       | Mistral AI API key        |
| `LUMINAE_SUPABASE_URL`             | ✅       | Supabase project URL      |
| `LUMINAE_SUPABASE_SERVICE_KEY`     | ✅       | Supabase service role key |
| `LUMINAE_UPSTASH_REDIS_REST_URL`   | ✅       | Redis/Upstash URL         |
| `LUMINAE_UPSTASH_REDIS_REST_TOKEN` | ✅       | Redis auth token          |
| `LUMINAE_MISTRAL_BUDGET_USD`       | Optional | Budget cap (default: $15) |
| `NEXT_PUBLIC_API_URL`              | ✅       | Backend URL for frontend  |
| `NEXT_PUBLIC_SUPABASE_URL`         | ✅       | Client-side Supabase URL  |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`    | ✅       | Client-side Supabase key  |

## 🛡️ Budget Protection

3-layer cost protection ensures we never exceed the $15 budget:

1. **Pre-flight estimation** — Rejects requests estimated > $0.50
2. **Global circuit breaker** — Halts all processing if remaining budget < $2.00 (Redis-backed)
3. **Usage logging** — Every API call logged to Redis (7-day TTL) + Supabase for audit

## 🌐 Deployment

| Component    | Platform      | Why                                           |
| ------------ | ------------- | --------------------------------------------- |
| **Frontend** | Vercel        | Edge-optimized Next.js hosting                |
| **Backend**  | Render        | Supports long-running tasks (30-90s analysis) |
| **Database** | Supabase      | PostgreSQL + Auth + Row Level Security        |
| **Cache**    | Upstash Redis | Serverless Redis for budget tracking          |

## 📁 Tech Stack

| Layer    | Technology                                                      |
| -------- | --------------------------------------------------------------- |
| Frontend | Next.js 16.1, TypeScript, Tailwind CSS, Zustand, TanStack Query |
| Backend  | FastAPI, Python 3.11, Pydantic, asyncio                         |
| AI       | Mistral OCR, Ministral 3B/8B, structured JSON output            |
| Database | Supabase (PostgreSQL + RLS)                                     |
| Cache    | Redis / Upstash                                                 |
| Monorepo | Turborepo + pnpm workspaces                                     |

## 📄 License

MIT

---

<p align="center">
  Built with 🧠 for the <strong>Mistral AI Hackathon 2026</strong> — Mistral Vibe Track
</p>
