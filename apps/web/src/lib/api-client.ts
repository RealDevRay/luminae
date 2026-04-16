const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
import { supabase } from '@/lib/supabase'

export interface AnalysisJob {
  job_id: string
  status: string
  estimated_cost_usd?: number
  estimated_time_seconds?: number
  check_status_url?: string
  paper?: {
    id: string
    filename: string
    title?: string
  }
  analysis?: any
  error_message?: string
  economics?: {
    total_tokens_used: number
    estimated_cost_usd: number
    cache_hits: number
    processing_time_seconds: number
  }
}

export interface BudgetInfo {
  remaining_usd: number
  total_budget_usd: number
  papers_remaining: number
  is_demo_mode: boolean
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = API_URL) {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit & { timeoutMs?: number } = {}
  ): Promise<T> {
    const { timeoutMs, ...fetchOptions } = options
    const controller = new AbortController()
    const id = timeoutMs ? setTimeout(() => controller.abort(), timeoutMs) : null
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token
    const url = `${this.baseUrl}${endpoint}`

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...fetchOptions.headers,
        },
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`API Error: ${response.status} - ${error}`)
      }

      return await response.json()
    } finally {
      if (id) clearTimeout(id)
    }
  }

  async analyze(
    fileBase64: string,
    filename: string,
    options?: {
      extract_figures?: boolean
      generate_grant?: boolean
    }
  ): Promise<AnalysisJob> {
    return this.request('/api/v1/analyze', {
      method: 'POST',
      timeoutMs: 180000,
      body: JSON.stringify({
        file_base64: fileBase64,
        filename,
        options,
      }),
    })
  }

  async analyzeUrl(
    fileUrl: string,
    filename: string,
    options?: {
      extract_figures?: boolean
      generate_grant?: boolean
    }
  ): Promise<AnalysisJob> {
    return this.request('/api/v1/analyze', {
      method: 'POST',
      timeoutMs: 180000,
      body: JSON.stringify({
        file_url: fileUrl,
        filename,
        options,
      }),
    })
  }

  async compare(jobIds: string[]): Promise<AnalysisJob> {
    return this.request('/api/v1/compare', {
      method: 'POST',
      timeoutMs: 180000,
      body: JSON.stringify({
        job_ids: jobIds,
      }),
    })
  }

  async getStatus(jobId: string): Promise<AnalysisJob> {
    return this.request(`/api/v1/status/${jobId}`)
  }

  async getResults(jobId: string): Promise<AnalysisJob> {
    return this.request(`/api/v1/results/${jobId}`)
  }

  async getBudget(): Promise<BudgetInfo> {
    return this.request('/api/v1/budget')
  }

  async healthCheck(): Promise<{ status: string }> {
    return this.request('/health')
  }

  async chat(
    message: string,
    conversationHistory: { role: string; content: string }[],
    paperId?: string
  ): Promise<{ reply: string; tokens_used?: number }> {
    return this.request('/api/v1/chat', {
      method: 'POST',
      timeoutMs: 30000,
      body: JSON.stringify({
        message,
        paper_id: paperId || null,
        conversation_history: conversationHistory,
      }),
    })
  }
}

export const apiClient = new ApiClient()
