export interface FigureAnalysis {
  id: string;
  type: 'chart' | 'diagram' | 'microscopy' | 'photo' | 'graph' | 'table';
  description: string;
  key_data_trends: string;
  statistical_significance?: string;
  alternative_interpretations: string[];
  confidence: number;
  base64_image?: string;
}

export interface TableData {
  id: string;
  caption: string;
  rows: number;
  columns: number;
  data: Record<string, unknown>[];
}

export interface MethodologyFlaw {
  severity: 'critical' | 'warning' | 'note';
  category: 'design' | 'statistics' | 'reproducibility' | 'validity';
  description: string;
  section_reference: string;
  suggested_fix: string;
  impact?: string;
}

export interface MethodologyCritique {
  flaws: MethodologyFlaw[];
  overall_score: number;
  reproducibility_rating: 'high' | 'medium' | 'low';
  confidence: number;
  key_strengths: string[];
  critical_gaps: string[];
}

export interface DatasetAudit {
  size_assessment: 'adequate' | 'underpowered' | 'excessive';
  bias_sources: string[];
  ethical_concerns: string[];
  recommendations: string[];
  missing_data_handling?: string;
  representation_issues?: string[];
}

export interface ExperimentProposal {
  id: string;
  title: string;
  hypothesis: string;
  method: string;
  expected_outcome: string;
  feasibility_score: number;
  estimated_budget: string;
}

export interface GrantOutline {
  title: string;
  specific_aims: string[];
  research_strategy: string;
  expected_outcomes: string;
  timeline: string;
  budget_estimate: string;
}

export interface Synthesis {
  key_insights: string[];
  unified_assessment: string;
  conflicts_resolved: string[];
}

export interface Economics {
  total_tokens_used: number;
  estimated_cost_usd: number;
  cache_hits: number;
  processing_time_seconds: number;
}

export interface PaperMetadata {
  title: string;
  authors: string[];
  abstract: string;
  upload_timestamp: string;
  processing_duration_ms: number;
}

export interface ExtractionResult {
  ocr_text: string;
  figures: FigureAnalysis[];
  tables: TableData[];
}

export interface LuminaeAnalysis {
  paper_id: string;
  metadata: PaperMetadata;
  extraction: ExtractionResult;
  critique: {
    methodology: MethodologyCritique;
    dataset: DatasetAudit;
  };
  improvements: {
    experiments: ExperimentProposal[];
    key_insights: string[];
  };
  grant_outline: GrantOutline;
  economics: Economics;
}

export interface AnalysisJob {
  job_id: string;
  status: 'uploaded' | 'processing_ocr' | 'processing_vision' | 'analyzing' | 'complete' | 'error';
  estimated_cost_usd?: number;
  estimated_time_seconds?: number;
  check_status_url?: string;
  paper?: {
    id: string;
    filename: string;
    title?: string;
  };
  analysis?: LuminaeAnalysis;
  error_message?: string;
  economics?: Economics;
}

export interface AnalysisRequest {
  file_base64?: string;
  file_url?: string;
  filename: string;
  options?: {
    extract_figures?: boolean;
    generate_grant?: boolean;
    priority?: 'normal' | 'fast';
  };
}

export interface BudgetInfo {
  remaining_usd: number;
  total_budget_usd: number;
  papers_remaining: number;
  is_demo_mode: boolean;
}

export interface UsageLog {
  id?: string;
  paper_id?: string;
  endpoint: string;
  model: string;
  input_tokens: number;
  output_tokens: number;
  estimated_cost: number;
  actual_cost: number;
  timestamp?: string;
}
