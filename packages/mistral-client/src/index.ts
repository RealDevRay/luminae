import type { LuminaeAnalysis, AnalysisJob, BudgetInfo, UsageLog } from '@luminae/types';

export interface MistralClientConfig {
  apiKey: string;
  baseUrl?: string;
  maxRetries?: number;
  timeout?: number;
}

export interface RequestOptions {
  maxTokens?: number;
  temperature?: number;
  topP?: number;
}

export class MistralClient {
  private apiKey: string;
  private baseUrl: string;
  private maxRetries: number;
  private timeout: number;

  constructor(config: MistralClientConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://api.mistral.ai/v1';
    this.maxRetries = config.maxRetries || 3;
    this.timeout = config.timeout || 60000;
  }

  private async request<T>(
    endpoint: string,
    method: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
    };

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify({ ...body, ...options }) : undefined,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Mistral API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  async chatComplete(
    model: string,
    messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
    options?: RequestOptions
  ) {
    return this.request('/chat/completions', 'POST', {
      model,
      messages,
      ...options,
    });
  }

  async ocrDocument(
    document: { type: 'document_url' | 'document_base64'; document: string }[],
    options?: {
      include_image_base64?: boolean;
      table_format?: 'markdown' | 'html';
    }
  ) {
    return this.request('/ocr', 'POST', {
      model: 'mistral-ocr-latest',
      document,
      ...options,
    });
  }

  async visionAnalyze(
    model: string,
    images: string[],
    prompt: string,
    options?: RequestOptions
  ) {
    return this.request('/vision/chat', 'POST', {
      model,
      images,
      messages: [{ role: 'user', content: prompt }],
      ...options,
    });
  }
}

export interface LuminaeApiClientConfig {
  apiUrl: string;
  apiKey?: string;
}

export class LuminaeApiClient {
  private apiUrl: string;
  private apiKey?: string;

  constructor(config: LuminaeApiClientConfig) {
    this.apiUrl = config.apiUrl;
    this.apiKey = config.apiKey;
  }

  private async request<T>(
    endpoint: string,
    method: string,
    body?: unknown
  ): Promise<T> {
    const url = `${this.apiUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  async analyze(request: {
    file_base64?: string;
    filename: string;
    options?: {
      extract_figures?: boolean;
      generate_grant?: boolean;
    };
  }): Promise<AnalysisJob> {
    return this.request('/api/v1/analyze', 'POST', request);
  }

  async getStatus(jobId: string): Promise<AnalysisJob> {
    return this.request(`/api/v1/status/${jobId}`, 'GET');
  }

  async getResults(jobId: string): Promise<AnalysisJob> {
    return this.request(`/api/v1/results/${jobId}`, 'GET');
  }

  async getBudget(): Promise<BudgetInfo> {
    return this.request('/api/v1/budget', 'GET');
  }

  async reanalyze(jobId: string): Promise<AnalysisJob> {
    return this.request('/api/v1/reanalyze', 'POST', { job_id: jobId });
  }

  async healthCheck(): Promise<{ status: string }> {
    return this.request('/health', 'GET');
  }
}

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export function estimateCost(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const pricing: Record<string, { input: number; output: number }> = {
    'mistral-ocr-latest': { input: 0.001, output: 0.001 },
    'ministral-3b-2512': { input: 0.0001, output: 0.0001 },
    'ministral-8b-2512': { input: 0.0002, output: 0.0002 },
    'magistral-medium-latest': { input: 0.002, output: 0.006 },
    'mistral-large-latest': { input: 0.002, output: 0.006 },
  };

  const modelPricing = pricing[model] || { input: 0.001, output: 0.001 };

  const inputCost = (inputTokens / 1000) * modelPricing.input;
  const outputCost = (outputTokens / 1000) * modelPricing.output;

  return Number((inputCost + outputCost).toFixed(4));
}
