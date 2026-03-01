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
    options: RequestInit = {}
  ): Promise<T> {
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token

    const url = `${this.baseUrl}${endpoint}`
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`API Error: ${response.status} - ${error}`)
    }

    return response.json()
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
      body: JSON.stringify({
        file_base64: fileBase64,
        filename,
        options,
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
}

export const apiClient = new ApiClient()
