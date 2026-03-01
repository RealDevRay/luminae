# Mistral Worldwide Hackathon: LUMINAE

### Autonomous Research Illumination System

<p align="center">
  <img src="https://img.shields.io/badge/MISTRAL%20AI-DEVELOPER-F97316?style=for-the-badge&logo=mistral&logoColor=white" alt="Mistral AI Developer Badge" />
  <img src="https://img.shields.io/badge/MODEL-ministral--8b--2512-black?style=for-the-badge" alt="ministral-8b" />
  <img src="https://img.shields.io/badge/MODEL-ministral--3b--2512-black?style=for-the-badge" alt="ministral-3b" />
  <img src="https://img.shields.io/badge/MODEL-mistral--ocr--latest-black?style=for-the-badge" alt="mistral-ocr" />
</p>

<p align="center">
  <a href="#demo">📺 Demo</a> •
  <a href="#features">✨ Features</a> •
  <a href="#architecture">🏗️ Architecture</a> •
  <a href="#agents">🧠 AI Agents</a> •
  <a href="#deployment">🚀 Deployment</a>
</p>

---

## 🚀 HACKATHON TRACK OVERVIEW

**Track:** `2) Anything goes`  
**Description:** _Use Mistral models through the API or OSS tools to create the best demos._  
**Team:** Aletheia Labs  
**Demo Duration:** 2 minutes

---

## <a name="demo"></a>📺 Demo

> **YouTube Demo (2 min)**: _[Link will be added]_

---

## 1. EXECUTIVE SUMMARY

**Luminae** is an autonomous research analysis platform that transforms academic papers into actionable intelligence. Using Mistral AI's multimodal capabilities, it performs deep critique, identifies methodological flaws, proposes novel experiments, and generates grant proposals — all within a strict $15 API budget through intelligent caching and cost optimization.

---

## <a name="features"></a>✨ WHAT LUMINAE DOES

Upload any document (or paste a public URL) and Luminae's 5 AI agents deliver:

| Feature                     | What You Get                                                                      |
| --------------------------- | --------------------------------------------------------------------------------- |
| 🔍 **Smart Ingestion**      | Full text, figures, and tables extracted from PDFs, DOCX, PPTX, and images        |
| 🧬 **Methodology Critique** | Design flaws, statistical power issues, reproducibility gaps — severity-rated     |
| 📊 **Dataset Audit**        | Bias detection, missing data assessment, representation analysis                  |
| 🧪 **Experiment Designer**  | 3 follow-up experiments with hypotheses, methods, feasibility scores, and budgets |
| 📝 **Grant Generator**      | NSF-style grant outline with specific aims, research strategy, and timeline       |
| 💡 **Synthesis Engine**     | Cross-agent insights that would surprise the original authors                     |
| 💰 **Budget Dashboard**     | Real-time API cost tracking with per-paper cost breakdown                         |
| 🔗 **URL Input**            | Paste any public document URL — no upload needed                                  |

### Supported Document Formats

| Method          | Formats                                               |
| --------------- | ----------------------------------------------------- |
| **File Upload** | PDF, DOCX, PPTX, PNG, JPG, AVIF, WebP                 |
| **URL Input**   | Any public URL to the above formats (e.g. arXiv PDFs) |

---

## 2. CORE VALUE PROPOSITION

| Problem                                                    | Luminae Solution                                                     |
| ---------------------------------------------------------- | -------------------------------------------------------------------- |
| Reading 50 papers for literature review takes weeks        | Complete analysis in 3 minutes                                       |
| Identifying methodological flaws requires domain expertise | AI critic with structured severity ratings                           |
| Designing follow-up experiments is cognitively expensive   | 3 novel experiments auto-generated                                   |
| Grant writing is time-consuming                            | NSF/NIH-style outline in seconds                                     |
| Research tools cost $100s/month                            | $15 API budget handles ~300 analyses (optimized to ~$0.05 per paper) |

---

## 3. MISTRAL AI CAPABILITIES UTILIZED

| Capability              | Model                              | Use Case                                          | Cost Control                                       |
| ----------------------- | ---------------------------------- | ------------------------------------------------- | -------------------------------------------------- |
| **Document OCR**        | `mistral-ocr-latest`               | PDF text extraction with structure preservation   | 24h Redis cache, SHA256 deduplication              |
| **Vision Analysis**     | `ministral-3b-2512` (fallback: 8B) | Figure extraction and interpretation              | Batch 5 figures/call, confidence threshold 0.7     |
| **Reasoning**           | `ministral-8b-2512`                | Methodology critique, synthesis, grant generation | Token estimation pre-flight, circuit breaker guard |
| **Agent Orchestration** | `ministral-8b-2512`                | Multi-agent workflow management                   | Parallel execution with asyncio.gather             |
| **Structured Outputs**  | All models                         | JSON schemas for type-safe responses              | Validation retry, strict JSON prompting            |

_Note: Models were aggressively optimized to `ministral-8b-2512` to guarantee high volume paper processing without breaking the $15.00 hackathon budget._

---

## <a name="architecture"></a>🏗️ SYSTEM ARCHITECTURE

### Technology Stack

- **Frontend**: Next.js 16.1 (App Router), TypeScript, Tailwind CSS, shadcn/ui, TanStack Query, Zustand
- **Backend**: FastAPI, Python 3.11, Pydantic, HTTPX
- **Database & Auth**: Supabase (PostgreSQL, Row Level Security)
- **Cache & Rate Limiting**: Redis (Upstash)
- **AI Layer**: Mistral AI APIs with Budget Protection Middleware

### Processing Pipeline

Steps 2a/2b/2c run in parallel via `asyncio.gather`:

```
Step 1: OCR  →  Step 2a: Vision Analysis     ┐
                Step 2b: Methodology Critique  ├→  Step 3: Experiments  →  Step 4: Synthesis  →  Step 5: Grant
                Step 2c: Dataset Audit        ┘
```

### Monorepo Structure (Turborepo)

```text
/luminae
├── apps/
│   ├── api/                   # FastAPI Backend (Python)
│   └── web/                   # Next.js Frontend (React)
├── packages/
│   ├── mistral-client/        # Shared Mistral Client wrapper
│   ├── types/                 # Shared TypeScript interfaces
│   └── ui/                    # Shared UI Components
├── schema.sql                 # Supabase Database Schema
├── turbo.json                 # Turborepo configuration
└── vercel.json                # Vercel Deployment configuration
```

---

## <a name="agents"></a>🧠 AI AGENTS

Luminae uses **5 specialized AI agents**, each with a unique persona:

| Agent                      | Persona                                      | Role                                                                                       |
| -------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------ |
| 🔬 **Methodology Critic**  | Dr. Elena Vasquez — 20yr peer review veteran | Identifies design flaws, statistical power issues, reproducibility gaps, validity threats  |
| 📊 **Dataset Auditor**     | Dr. James Chen — Data governance expert      | Audits dataset size, bias sources, missing data handling, ethical concerns, representation |
| 🧪 **Experiment Designer** | Dr. Sarah Okonkwo — Creative experimentalist | Designs 3 bold follow-up experiments with hypotheses, methods, feasibility scores          |
| 🔗 **Synthesis Agent**     | Cross-agent synthesizer                      | Resolves conflicts between agents, generates 3 surprising key insights                     |
| 📝 **Grant Generator**     | NSF proposal specialist                      | Creates complete grant outline: specific aims, research strategy, timeline, budget         |

Each agent outputs **strict JSON** for structured, parseable results displayed in a tabbed dashboard.

---

## <a name="deployment"></a>🚀 DEPLOYMENT GUIDE

### Backend (Render)

1. Create a new **Web Service** in Render
2. Connect to this GitHub repository
3. Configure:
   - Root Directory: `apps/api`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn src.main:app --host 0.0.0.0 --port $PORT`
4. Environment Variables:

| Variable                           | Description               |
| ---------------------------------- | ------------------------- |
| `LUMINAE_MISTRAL_API_KEY`          | Mistral AI API key        |
| `LUMINAE_SUPABASE_URL`             | Supabase project URL      |
| `LUMINAE_SUPABASE_SERVICE_KEY`     | Supabase service role key |
| `LUMINAE_UPSTASH_REDIS_REST_URL`   | Redis/Upstash URL         |
| `LUMINAE_UPSTASH_REDIS_REST_TOKEN` | Redis auth token          |
| `LUMINAE_MISTRAL_BUDGET_USD`       | `15.00`                   |

### Frontend (Vercel)

1. Import this repository in Vercel
2. Settings:
   - Framework: Next.js
   - Root Directory: `apps/web`
   - ✅ Include source files outside of the Root Directory
3. Environment Variables:

| Variable                        | Description              |
| ------------------------------- | ------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL     |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon public key |
| `NEXT_PUBLIC_API_URL`           | Render backend URL       |

### Database (Supabase)

Run `/schema.sql` in your Supabase SQL Editor to create `papers`, `analyses`, and `usage_logs` tables with RLS policies.

---

## 🛡️ BUDGET PROTECTION

3-layer cost protection ensures we never exceed the $15 budget:

1. **Pre-flight Estimation** — Approximates tokens before API call. Rejects requests > $0.50
2. **Global Circuit Breaker** — Redis-backed countdown. Halts if remaining < $2.00
3. **Usage Logging** — Exact costs logged to Supabase for audit

**Cost per paper**: ~$0.05 → **~300 papers** on $15 budget

---

<p align="center">
  Built with 🧠 by <strong>Aletheia Labs</strong> for the <strong>Mistral Worldwide Hackathon 2026</strong>
</p>
