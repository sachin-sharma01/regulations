export type ReviewStatus =
  | 'unreviewed'
  | 'in_progress'
  | 'done'
  | 'approved'
  | 'approved_it';

export type ImpactLevel = 'high' | 'medium' | 'low' | 'not_applicable';

export interface Regulation {
  id: string;
  title: string;
  summary_sv: string;
  source: string;
  category: string;
  impact_level: ImpactLevel;
  review_status: ReviewStatus;
  reviewer_note: string | null;
  affected_departments: string[];
  required_actions: string[];
  deadline: string | null;
  processed_at: string;
  relevance_reason: string | null;
  effort_level: string | null;
  impact_when_in_place: string | null;
}

export type TicketStatus = 'open' | 'in_progress' | 'done';

export interface ITTicket {
  id: string;
  regulation_id: string;
  technical_spec: string | null;
  csharp_code: string | null;
  ai_prompt: string | null;
  status: TicketStatus;
  created_at: string;
}


export interface ChatSource {
  number: number;
  title: string;
  similarity?: string;
  impact_level?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  sources: ChatSource[];
  refused?: boolean;
  latency?: number;
}

export interface ITAnalysisResult {
  requires_it_change: boolean;
  technical_spec: string;
  csharp_code?: string;
  ai_prompt?: string;
}
