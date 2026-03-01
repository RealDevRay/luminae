# Luminae: Cost Estimation & Deployment Strategy

## 1. Mistral API Cost Estimation

We have strategically configured the application to use the most cost-effective **Ministral** and **Mistral OCR** models to ensure your $15 hackathon budget stretches as far as possible.

Here is the estimated cost breakdown for analyzing a standard **10-page academic paper**:

| AI Agent / Service                         | Model                | Est. Input Tokens  | Est. Output Tokens | Cost Estimate (USD) |
| :----------------------------------------- | :------------------- | :----------------- | :----------------- | :------------------ |
| **PDF Extraction (Text, Tables, Figures)** | `mistral-ocr-latest` | ~15,000 (10 pages) | ~8,000             | ~$0.023             |
| **Vision Agent (Analyzing 5 figures)**     | `ministral-3b-2512`  | ~5,000             | ~1,000             | ~$0.0006            |
| **Methodology Critic**                     | `ministral-8b-2512`  | ~8,000             | ~1,000             | ~$0.0018            |
| **Dataset Auditor**                        | `ministral-8b-2512`  | ~8,000             | ~800               | ~$0.0017            |
| **Experiment Designer**                    | `ministral-8b-2512`  | ~9,000             | ~1,200             | ~$0.0020            |
| **Synthesis Agent**                        | `ministral-8b-2512`  | ~3,000             | ~800               | ~$0.0007            |
| **Grant Generator**                        | `ministral-8b-2512`  | ~3,000             | ~1,000             | ~$0.0008            |
| **Total per Paper**                        |                      |                    |                    | **~$0.030 USD**     |

### Budget Safety

At roughly **3 cents per paper**, your $15 hackathon budget allows for approximately **500 paper analyses**.
Even if the judges upload massive 50-page papers, the cost will barely exceed $0.10-$0.15 per run. You are perfectly safe and will not deplete your credits during testing or judging. Furthermore, the **Budget Guard Middleware** is actively monitoring Redis and Supabase. If costs spike unexpectedly, it will trigger the `Circuit Breaker` and refuse to process papers that exceed the $0.50 per-request limit.

---

## 2. Deployment Architecture (Vercel vs. Render)

### Should we move the Python API into Next.js API Routes?

**Recommendation: NO. Keep the Python backend separate (deploy to Render).**

While Vercel's Next.js API routes are great, moving this specific backend is highly discouraged for these reasons:

1. **Long-Running Tasks:** Processing a 20-page PDF through OCR, Vision, and 5 separate reasoning agents takes **30 to 90 seconds**. Vercel's Serverless Functions (Hobby/Free tier) have a hard timeout limit of **10 to 15 seconds**. If you move the backend to Next.js, the analysis jobs will constantly time out and fail.
2. **Background Jobs:** The FastAPI backend utilizes `BackgroundTasks` to immediately return a `job_id` to the user while the heavy processing happens asynchronously. Next.js Serverless Functions freeze the moment the response is sent; they cannot handle true background tasks over long periods.
3. **Ecosystem:** The python `mistralai` SDK is natively tailored for these orchestration workloads, making debugging much easier than juggling Edge routines.

### Recommended Deployment Flow

#### **Frontend (Next.js)** -> **Deploy to Vercel**

1. Push `apps/web` to your GitHub repository.
2. Import the project into Vercel.
3. _Crucial:_ Set the Vercel Root Directory to `apps/web`.
4. Add all Supabase and API `.env` variables to the Vercel dashboard.

#### **Backend (FastAPI)** -> **Deploy to Render (Web Service)**

1. Push `apps/api` to your GitHub repository.
2. Create a new "Web Service" in Render.
3. _Crucial:_ Set the Root Directory to `apps/api`.
4. Build Command: `pip install -r requirements.txt`
5. Start Command: `uvicorn src.main:app --host 0.0.0.0 --port $PORT`
6. Add the Mistral, Supabase, and Redis `.env` keys.

This decoupled structure guarantees the frontend remains lightning fast while Render handles the heavy Mistral AI orchestration asynchronously without timing out!
