# Mistral Worldwide Hackathon: LUMINAE

### Autonomous Research Illumination System

<p align="center">
  <img src="https://img.shields.io/badge/MISTRAL%20AI-DEVELOPER-F97316?style=for-the-badge&logo=mistral&logoColor=white" alt="Mistral AI Developer Badge" />
  <img src="https://img.shields.io/badge/MODEL-ministral--8b--2512-black?style=for-the-badge" alt="ministral-8b" />
  <img src="https://img.shields.io/badge/MODEL-ministral--3b--2512-black?style=for-the-badge" alt="ministral-3b" />
  <img src="https://img.shields.io/badge/MODEL-mistral--ocr--latest-black?style=for-the-badge" alt="mistral-ocr" />
</p>

---

## 🚀 HACKATHON TRACK OVERVIEW

**Track:** `2) Anything goes`  
**Description:** _Use Mistral models through the API or OSS tools to create the best demos._

**Demo Duration:** 2 minutes  
**Team Size:** 1-4 participants

---

## 1. EXECUTIVE SUMMARY

**Luminae** is an autonomous research analysis platform that transforms academic papers into actionable intelligence. Using Mistral AI's multimodal capabilities, it performs deep critique, identifies methodological flaws, proposes novel experiments, and generates grant proposals—all within a strict $15 API budget through intelligent caching and cost optimization.

---

## 2. CORE VALUE PROPOSITION

| Problem                                                    | Luminae Solution                                                              |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Reading 50 papers for literature review takes weeks        | Complete analysis in 3 minutes                                                |
| Identifying methodological flaws requires domain expertise | AI critic with structured severity ratings                                    |
| Designing follow-up experiments is cognitively expensive   | 3 novel experiments auto-generated                                            |
| Grant writing is time-consuming                            | NSF/NIH-style outline in seconds                                              |
| Research tools cost $100s/month                            | $15 API budget handles 18 full analyses (Optimized to ~$0.03-$0.82 per paper) |

---

## 3. MISTRAL AI CAPABILITIES UTILIZED

### 3.1 Full Capability Matrix

| Capability              | Model                              | Use Case                                          | Cost Control                                         |
| ----------------------- | ---------------------------------- | ------------------------------------------------- | ---------------------------------------------------- |
| **Document OCR**        | `mistral-ocr-latest`               | PDF text extraction with structure preservation   | 24h Redis cache, SHA256 deduplication                |
| **Vision Analysis**     | `ministral-3b-2512` (fallback: 8B) | Figure extraction and interpretation              | Batch 5 figures/call, confidence threshold 0.7       |
| **Reasoning**           | `ministral-8b-2512`                | Methodology critique, synthesis, grant generation | Token estimation pre-flight, circuit breaker guard   |
| **Agent Orchestration** | `ministral-8b-2512`                | Multi-agent workflow management                   | Parallel execution with semaphore (max 3 concurrent) |
| **Structured Outputs**  | All models                         | JSON schemas for type-safe responses              | Validation retry (max 2x), Pydantic enforcement      |
| **Document Library**    | Supabase                           | Caching previous analyses                         | Database persistence, infinite TTL                   |

_Note: Initially designed with `magistral-medium-latest` and `mistral-large-latest`, the models were aggressively optimized to `ministral-8b-2512` to guarantee high volume paper processing without breaking the $15.00 hackathon budget._

---

## 4. SYSTEM ARCHITECTURE

### 4.1 Technology Stack

- **Frontend**: Next.js 16.1 (App Router), TypeScript, Tailwind CSS, shadcn/ui, TanStack Query, Zustand
- **Backend**: FastAPI, Python 3.11, Pydantic, HTTPX
- **Database & Auth**: Supabase (PostgreSQL, Row Level Security)
- **Cache & Rate Limiting**: Redis (Upstash / Redis Cloud)
- **AI Layer**: Mistral AI APIs with Budget Protection Middleware

### 4.2 Monorepo Structure (Turborepo)

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

## 5. FEATURE SPECIFICATIONS

| Feature                  | Description                                     | Technical Implementation                         |
| ------------------------ | ----------------------------------------------- | ------------------------------------------------ |
| **Smart Ingestion**      | PDF upload with OCR and vision                  | `mistral-ocr-latest` + `ministral-3b-2512`       |
| **Methodology Critique** | Identifies design flaws, statistical issues     | Reasoning agent with structured severity ratings |
| **Dataset Audit**        | Evaluates size, bias, ethics                    | Parallel agent with governance focus             |
| **Experiment Designer**  | Proposes 3 novel follow-ups                     | Creative agent with feasibility scoring          |
| **Synthesis Engine**     | Combines all critiques into coherent assessment | Reasoning model with conflict resolution         |
| **Grant Generator**      | NSF/NIH-style proposal outline                  | Structured output with specific aims             |
| **Budget Dashboard**     | Real-time API cost tracking                     | Middleware + Supabase logging                    |

---

## 6. DEPLOYMENT GUIDE

The project is structured to deploy the Frontend and Backend separately. We use **Render** for the Python API because Vercel/Next.js Serverless Functions time out after 10-15 seconds (severely interrupting Mistral AI's 60-second background agent orchestration calls).

### 6.1 Backend (Render)

1. In Render, create a new **Web Service**.
2. Connect it to this GitHub repository.
3. Configure the following build settings:
   - Root Directory: `apps/api`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn src.main:app --host 0.0.0.0 --port $PORT`
4. Supply your `Environment Variables`:
   - `LUMINAE_MISTRAL_API_KEY`: Your Mistral API Key
   - `LUMINAE_SUPABASE_URL`: Your Supabase Project URL (`https://...supabase.co`)
   - `LUMINAE_SUPABASE_SERVICE_KEY`: Your Supabase `service_role` secret key
   - `LUMINAE_UPSTASH_REDIS_REST_URL`: Your Upstash or Redis Cloud URL (`redis://...`)
   - `LUMINAE_UPSTASH_REDIS_REST_TOKEN`: Your Redis password/token
   - `LUMINAE_MISTRAL_BUDGET_USD`: `15.00`
   - `LUMINAE_MAX_REQUEST_USD`: `0.50`
   - `LUMINAE_CIRCUIT_BREAKER_THRESHOLD`: `2.00`
   - `LUMINAE_DEMO_MODE`: `false`

### 6.2 Frontend (Vercel)

1. Import this repository in Vercel.
2. Under Project Settings -> General:
   - Framework Preset: `Next.js`
   - Root Directory: `apps/web`
   - Note: _Ensure "Include source files outside of the Root Directory" is checked so the root Monorepo packages do not break!_
   - Note: _A `vercel.json` file is pushed to the repo to correctly configure the Turborepo output paths automatically._
3. Supply your `Environment Variables`:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase `anon` public key
   - `NEXT_PUBLIC_API_URL`: The URL of your deployed Render Backend (e.g., `https://luminae-api-xxxx.onrender.com`)

### 6.3 Database (Supabase)

Run the SQL queries found in `/schema.sql` in your Supabase SQL Editor. This initializes the `papers`, `analyses`, and `usage_logs` tables along with their secure Row Level Security (RLS) policies.

---

## 7. BUDGET PROTECTION & ECONOMICS

The application features a 3-layer Budget Guard algorithm:

1. **Pre-flight Estimation:** Approximates input/output tokens using model-specific weights before making the API call. Rejects requests estimated over $0.50.
2. **Global Circuit Breaker:** Uses Redis to maintain a countdown of the $15 allowance. Halts analysis if the global budget drops below $2.00.
3. **Usage Logging:** Posts actual exact token usage costs retrieved from the API response to the `usage_logs` PostgreSQL table.

Using highly optimized models like `ministral-8b-2512` and `mistral-ocr-latest`, Luminae achieves an approximate processing cost of **$0.03 - $0.82 per paper**, easily clearing the requirements of the Mistral World Hackathon.
