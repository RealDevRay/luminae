# Luminae — Strategic Improvement & Competitive Analysis

> **Document Version:** 2.0  
> **Project:** Luminae — Autonomous Research Illumination System  
> **Team:** Aletheia Labs  
> **Last Updated:** 2026-04-15  
> **Scope:** Full-stack audit covering Backend (FastAPI), Frontend (Next.js), Database (Supabase), Caching (Redis), AI Pipeline (Mistral), DevOps (Vercel/Render), and competitive positioning.

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Competitive Landscape Analysis](#competitive-landscape-analysis)
3. [Phase 1: Production Stability (DONE)](#phase-1-production-stability)
4. [Phase 2: Core Feature Gaps](#phase-2-core-feature-gaps)
5. [Phase 3: Polish & UX](#phase-3-polish--ux)
6. [Phase 4: Competitive Differentiation](#phase-4-competitive-differentiation)
7. [Implementation Roadmap](#implementation-roadmap)

---

## Executive Summary

After scanning every source file across the monorepo (38+ files, ~5,000 lines), Luminae has a **strong foundation** — multi-agent AI, budget protection, OCR/Vision/Reasoning pipeline, and clean monorepo architecture. However, to be **competitive** against tools like Elicit, SciSpace, Consensus, and Semantic Scholar, it needs significant improvements in three areas:

1. **Reliability & Production Readiness** — Critical bugs that cause data loss and silent failures
2. **User Value Features** — Features that competitors already offer and users expect
3. **UX & Design Polish** — The gap between "hackathon project" and "product users trust"

### Files Changed/Created Summary

#### Phase 1 Changes (Completed)
| File | Action | What Changed |
|:-----|:-------|:-------------|
| `apps/api/src/main.py` | MODIFIED | Removed `/debug` endpoint, locked CORS, added logging |
| `apps/api/src/routers/analysis.py` | MODIFIED | Fixed broken import, wired JobStore, added SSRF/size validation |
| `apps/api/src/services/mistral_client.py` | MODIFIED | Added retry/backoff to all 3 API methods |
| `apps/api/src/services/reasoning_service.py` | MODIFIED | Fixed silent JSON parse failures, added recovery + logging |
| `apps/api/src/services/job_store.py` | NEW | Redis-backed job persistence (replaces in-memory dicts) |
| `apps/api/src/utils/retry.py` | NEW | Exponential backoff utility with jitter |
| `apps/api/src/utils/validators.py` | NEW | SSRF protection + file size validation |
| `apps/api/requirements.txt` | MODIFIED | Pinned all dependencies to exact versions |

#### Phase 2 Changes (In Progress)
| File | Action | What Changed |
|:-----|:-------|:-------------|
| `apps/api/src/routers/chat.py` | NEW | AI-powered chat endpoint with paper context |
| `apps/api/src/routers/analysis.py` | MODIFIED | Added citation extraction agent, SSE streaming |
| `apps/api/src/services/reasoning_service.py` | MODIFIED | Added reference_extractor agent persona |
| `apps/web/src/components/chatbot/Chatbot.tsx` | MODIFIED | Replaced static FAQ with real Mistral AI calls |
| `apps/web/src/components/analysis/AnalysisDashboard.tsx` | MODIFIED | Added References tab |

---

## Competitive Landscape Analysis

### Where Luminae Stands vs Competitors

| Capability | Luminae | Elicit | SciSpace | Consensus | Semantic Scholar |
|:---|:---:|:---:|:---:|:---:|:---:|
| PDF Upload & OCR | ✅ | ✅ | ✅ | ❌ | ❌ |
| Methodology Critique | ✅ ⭐ | ❌ | ❌ | ❌ | ❌ |
| Dataset Audit | ✅ ⭐ | ❌ | ❌ | ❌ | ❌ |
| Experiment Design | ✅ ⭐ | ❌ | ❌ | ❌ | ❌ |
| Grant Proposal Gen | ✅ ⭐ | ❌ | ❌ | ❌ | ❌ |
| Chat with Paper | 🟡 → ✅ | ❌ | ✅ | ❌ | ❌ |
| Citation Extraction | ❌ → ✅ | ✅ | ❌ | ❌ | ✅ |
| Multi-Paper Compare | ❌ | ✅ | ❌ | ✅ | ❌ |
| Literature Discovery | ❌ | ✅ | ✅ | ✅ | ✅ |
| Real-Time Progress | 🟡 → ✅ | ✅ | ✅ | ✅ | N/A |
| Collaboration/Sharing | ❌ | ✅ | ✅ | ✅ | ✅ |

### Luminae's Unique Differentiators (protect & highlight)
- **5-Agent Peer Review Swarm** — No other tool does multi-persona methodology critique
- **Budget Transparency** — Real-time cost per analysis ($0.05/paper) is unique
- **Grant Generation** — Only Luminae generates NSF-style proposals from analysis
- **Vision + OCR Pipeline** — End-to-end multimodal analysis is rare

---

## Phase 1: Production Stability ✅ DONE

> All 9 tasks completed. Critical bugs fixed, security vulnerabilities patched.

### 1.1 Fixed Broken `/reanalyze` Import
- **File:** `apps/api/src/routers/analysis.py` line 270
- **Was:** `from services.reasoning_service import reasoning_service` (absolute import, crashes at runtime)
- **Now:** `from ..services.reasoning_service import reasoning_service` (relative import)

### 1.2 Removed `/debug` Endpoint
- **File:** `apps/api/src/main.py` lines 75-111
- **Risk:** Publicly exposed API key prefixes, Supabase URL, Redis URL, Python version
- **Fix:** Entire endpoint deleted

### 1.3 Locked Down CORS
- **File:** `apps/api/src/main.py`
- **Was:** `allow_origins=["*"]` (any website could make authenticated requests)
- **Now:** Whitelist `https://luminae.qzz.io` + localhost for dev mode via `LUMINAE_ENV`

### 1.4 Pinned Python Dependencies
- **File:** `apps/api/requirements.txt`
- **Was:** All unpinned (`fastapi`, `mistralai`, etc.)
- **Now:** Exact versions (`fastapi==0.135.0`, `mistralai==1.12.4`, etc.)

### 1.5 Persisted Jobs in Redis (JobStore)
- **New File:** `apps/api/src/services/job_store.py`
- **Problem:** In-memory Python dicts (`analysis_jobs`, `job_results`) wiped on every Render restart
- **Solution:** `JobStore` class persists all job state in Redis with 7-day TTL
- **Impact:** Users no longer lose analysis results when Render sleeps

### 1.6 Added Retry/Backoff to Mistral API Calls
- **New File:** `apps/api/src/utils/retry.py`
- **Modified:** `apps/api/src/services/mistral_client.py`
- **Problem:** Zero retry logic — a single 429/500/timeout killed the entire 5-agent pipeline
- **Solution:** `retry_with_backoff()` with exponential backoff + jitter (3 retries, 1-30s delays)

### 1.7 Fixed Silent JSON Parse Failures
- **File:** `apps/api/src/services/reasoning_service.py`
- **Problem:** `_parse_json()` returned `{}` on failure with no logging — user saw blank results
- **Solution:** Logs raw content, attempts `{...}` recovery, returns `_parse_error` marker for frontend

### 1.8 SSRF Protection on URL Input
- **New File:** `apps/api/src/utils/validators.py`
- **Problem:** Users could submit `file:///etc/passwd`, internal IPs, or cloud metadata URLs
- **Solution:** Blocks `file://`, private IP ranges, `localhost`, cloud metadata endpoints

### 1.9 Server-Side File Size Limit
- **File:** `apps/api/src/utils/validators.py`
- **Problem:** Client limited uploads to 20MB but server had no enforcement
- **Solution:** 25MB base64 limit enforced server-side (returns HTTP 413)

---

## Phase 2: Core Feature Gaps

> These features close the gap with competitors and dramatically increase user value.

### 2.1 ⭐ Wire Chatbot to Mistral AI ("Chat with Paper")
- **Status:** Done
- **Current:** Now dynamically uses context via new /api/v1/chat endpoint
- **Competitor:** SciSpace's "Chat with PDF" is their #1 feature
- **Implementation:**
  - New `/api/v1/chat` endpoint: takes `paper_id` + user message
  - Loads paper's OCR text as conversation context
  - Streams responses using Mistral's `ministral-8b` with SSE
  - Frontend: replaces `KNOWLEDGE_BASE` lookup with real AI-powered responses
  - Context-aware: "What methodology does this paper use?" works on the user's actual paper
- **Effort:** 4-6 hours

### 2.2 Citation & Reference Extraction
- **Status:** Done
- **Current:** Reference extraction running in parallel via reasoning_service
- **Implementation:**
  - Add `reference_extractor` agent persona to reasoning service
  - Extract structured references (title, authors, year, DOI) from OCR text
  - Display in a new "References" tab on the analysis dashboard
  - Link to DOI/Semantic Scholar where possible
- **Effort:** 3-4 hours

### 2.3 SSE Real-Time Progress
- **Status:** Done
- **Current:** Replaced setInterval polling with native EventSource handling via /api/v1/stream/{job_id}
- **Implementation:**
  - FastAPI SSE endpoint `/api/v1/stream/{job_id}`
  - Events: `ocr_started`, `ocr_complete`, `agent:methodology_started`, etc.
  - Frontend `EventSource` replaces `setInterval` polling
- **Effort:** 3-4 hours

### 2.4 OCR Hash-Based Caching
- **Status:** Done
- **Current:** Redis caching implemented in `ocr_service.py` to prevent redundant computations
- **Fix:** Check Redis for `ocr:{hash}` before calling Mistral OCR. Cache 24hr TTL
- **Effort:** 1 hour

### 2.5 Actual Token Usage Tracking
- **Status:** Done
- **Current:** Utilizes `contextvars` to tally usage strictly per-job internally in `mistral_client.py`
- **Fix:** Parse `response.usage` from each Mistral call for real costs
- **Effort:** 1 hour

---

## Phase 3: Polish & UX

### 3.1 Decompose the 772-Line AnalysisDashboard
- **File:** `apps/web/src/components/analysis/AnalysisDashboard.tsx`
- **Extract into:** `OverviewTab`, `CritiqueTab`, `ExperimentsTab`, `GrantTab`, `EconomicsTab`, `ExportPanel`, `ProgressIndicator`

### 3.2 Dark Mode Toggle
- CSS variables for `.dark` exist but no toggle mechanism
- Add `next-themes` with persisted preference

### 3.3 Loading Skeletons
- Replace full-screen spinners with shimmer skeletons matching layout

### 3.4 Error Boundaries
- No React error boundaries — a single render crash = white screen

### 3.5 Consistent Color Theming
- Components mix design tokens (`bg-foreground`) with hardcoded colors (`bg-indigo-600`)
- Standardize on HSL token system

### 3.6 Guest Abuse Protection
- Tighter rate limit for unauthenticated users (5/hour vs 60/min)

---

## Phase 4: Competitive Differentiation

### 4.1 Multi-Paper Comparison Mode
- Upload 2-5 papers in batch
- Individual analyses in parallel
- `comparison_agent` synthesizes findings across papers
- Side-by-side methodology scores matrix

### 4.2 Side-by-Side PDF Viewer
- `react-pdf` to render uploaded PDF alongside analysis
- Link OCR findings back to page numbers

### 4.3 Test Suite (pytest)
- Health endpoint, budget guard, JSON parsing, OCR type detection tests
- Add `pytest`, `httpx`, `pytest-asyncio` to requirements

### 4.4 CI/CD with GitHub Actions
- Lint, typecheck, test on every push

---

## Implementation Roadmap

### Phase 1: Production Stability — ✅ COMPLETE (Day 1)
9 fixes implemented across 8 files (3 new, 5 modified)

### Phase 2: Core Feature Gaps — ✅ COMPLETE (Days 2-4)
| # | Task | Effort | Status |
|:--|:-----|:-------|:-------|
| 2.1 | Chat with Paper (Mistral AI) | 4-6 hr | ✅ Done |
| 2.2 | Citation extraction | 3-4 hr | ✅ Done |
| 2.3 | SSE real-time progress | 3-4 hr | ✅ Done |
| 2.4 | OCR hash caching | 1 hr | ✅ Done |
| 2.5 | Actual token tracking | 1 hr | ✅ Done |

### Phase 3: Polish & UX — ✅ COMPLETE (Days 5-7)
| # | Task | Effort | Status |
|:--|:-----|:-------|:-------|
| 3.1 | Decompose AnalysisDashboard | 1-2 hr | ✅ Done |
| 3.2 | Dark mode toggle | 1 hr | ❌ Skipped by user request |
| 3.3 | Loading skeletons | 30 min | ✅ Done |
| 3.4 | Error boundaries | 30 min | ✅ Done |
| 3.5 | Consistent theming | 2 hr | ✅ Done |
| 3.6 | Guest abuse protection | 30 min | ✅ Done |

### Phase 4: Competitive Differentiation (Days 8-14)
| # | Task | Effort |
|:--|:-----|:-------|
| 4.1 | Multi-paper comparison | 8-12 hr |
| 4.2 | Side-by-side PDF viewer | 4-6 hr |
| 4.3 | Test suite | 4 hr |
| 4.4 | CI/CD pipeline | 2 hr |