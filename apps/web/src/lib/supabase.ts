import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      papers: {
        Row: {
          id: string
          user_id: string
          filename: string
          file_hash: string
          title: string | null
          authors: string[] | null
          abstract: string | null
          page_count: number | null
          status: string
          error_message: string | null
          total_cost_usd: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          filename: string
          file_hash: string
          title?: string | null
          authors?: string[] | null
          abstract?: string | null
          page_count?: number | null
          status?: string
          error_message?: string | null
          total_cost_usd?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          filename?: string
          file_hash?: string
          title?: string | null
          authors?: string[] | null
          abstract?: string | null
          page_count?: number | null
          status?: string
          error_message?: string | null
          total_cost_usd?: number
          created_at?: string
          updated_at?: string
        }
      }
      analyses: {
        Row: {
          id: string
          paper_id: string
          methodology_critique: any
          dataset_audit: any
          experiment_proposals: any
          synthesis: any
          grant_outline: any
          overall_confidence: number | null
          processing_time_ms: number | null
          raw_agent_outputs: any | null
          created_at: string
        }
        Insert: {
          id?: string
          paper_id: string
          methodology_critique: any
          dataset_audit: any
          experiment_proposals: any
          synthesis: any
          grant_outline: any
          overall_confidence?: number | null
          processing_time_ms?: number | null
          raw_agent_outputs?: any | null
          created_at?: string
        }
        Update: {
          id?: string
          paper_id?: string
          methodology_critique?: any
          dataset_audit?: any
          experiment_proposals?: any
          synthesis?: any
          grant_outline?: any
          overall_confidence?: number | null
          processing_time_ms?: number | null
          raw_agent_outputs?: any | null
          created_at?: string
        }
      }
    }
  }
}
