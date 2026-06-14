import type { Regulation, ITTicket, ITAnalysisResult } from '@/types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY as string;
const HEADERS = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
};

export function tryParse<T>(val: unknown, fallback: T): T {
  if (Array.isArray(val)) return val as unknown as T;
  try { return JSON.parse(String(val ?? '[]')) as T; }
  catch { return fallback; }
}

export async function fetchRegulations(): Promise<Regulation[]> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/regulations?order=processed_at.desc`, { headers: HEADERS });
  if (!res.ok) throw new Error(`Supabase error ${res.status}`);
  const data = await res.json() as Regulation[];
  return data.map(item => ({
    ...item,
    affected_departments: tryParse(item.affected_departments, []),
    required_actions: tryParse(item.required_actions, []),
  }));
}

export async function fetchTickets(): Promise<ITTicket[]> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/it_tickets?order=created_at.desc`, { headers: HEADERS });
  if (!res.ok) throw new Error(`Supabase error ${res.status}`);
  return res.json() as Promise<ITTicket[]>;
}

export async function updateReg(id: string, fields: Partial<Regulation>): Promise<void> {
  await fetch(`${SUPABASE_URL}/rest/v1/regulations?id=eq.${id}`, {
    method: 'PATCH', headers: HEADERS, body: JSON.stringify(fields),
  });
}

export async function insertTicket(ticket: ITTicket): Promise<ITTicket[]> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/it_tickets`, {
    method: 'POST',
    headers: { ...HEADERS, Prefer: 'return=representation' },
    body: JSON.stringify(ticket),
  });
  if (!res.ok) throw new Error(`Insert ticket failed ${res.status}`);
  return res.json() as Promise<ITTicket[]>;
}

export async function updateTicket(id: string, fields: Partial<ITTicket>): Promise<void> {
  await fetch(`${SUPABASE_URL}/rest/v1/it_tickets?id=eq.${id}`, {
    method: 'PATCH', headers: HEADERS, body: JSON.stringify(fields),
  });
}

export async function generateITAnalysis(regulation: Regulation): Promise<ITAnalysisResult> {
  const response = await fetch('/api/generate-it-ticket', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: regulation.title,
      source: regulation.source,
      category: regulation.category,
      summary_sv: regulation.summary_sv,
      required_actions: tryParse(regulation.required_actions, []).join(', '),
      deadline: regulation.deadline || 'Not specified',
      impact_level: regulation.impact_level,
    }),
  });
  if (!response.ok) throw new Error(`Proxy error ${response.status}`);
  const data = await response.json() as { content?: Array<{ text?: string }> };
  const text = data.content?.map(b => b.text || '').join('') || '';
  const clean = text.replace(/```json|```/g, '').trim();
  return JSON.parse(clean) as ITAnalysisResult;
}
