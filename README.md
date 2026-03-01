# Luminae - Autonomous Research Illumination System

Transform academic papers into actionable intelligence using Mistral AI.

## Features

- **Smart Ingestion**: PDF upload with OCR and vision analysis
- **Methodology Critique**: Identify design flaws with severity ratings
- **Dataset Audit**: Evaluate size, bias, and ethics
- **Experiment Designer**: Get 3 novel follow-up experiments
- **Grant Generator**: NSF/NIH-style proposal outlines
- **Budget Protected**: Complete analysis for under $1

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: FastAPI, Python 3.11
- **AI**: Mistral AI (OCR, Vision, Reasoning)
- **Cache**: Redis (Upstash)
- **Database**: Supabase PostgreSQL

## Quick Start

```bash
# Install dependencies
pnpm install

# Run development
pnpm dev
```

## Environment Variables

Copy `.env.example` to `.env` and fill in:

- `LUMINAE_MISTRAL_API_KEY` - Your Mistral API key
- `LUMINAE_SUPABASE_URL` - Supabase project URL
- `LUMINAE_UPSTASH_REDIS_REST_URL` - Upstash Redis URL

## Deployment

### Backend (Render)
```bash
cd apps/api
docker build -t luminae-api .
```

### Frontend (Vercel)
```bash
cd apps/web
vercel --prod
```

## Cost Breakdown

| Component | Cost Per Paper |
|-----------|---------------|
| OCR | $0.05 |
| Vision | $0.02 |
| AI Agents | $0.75 |
| **Total** | **$0.82** |

With $15 budget: ~18 papers/month
