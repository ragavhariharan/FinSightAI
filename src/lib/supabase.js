import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.warn('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY — copy .env.example to .env.local');
}

export const supabase = createClient(url || '', anonKey || '');

/** Map MCQ UI label → DB persona_type enum */
export const PERSONA_LABEL_TO_DB = {
  'Student': 'student',
  'Salaried employee': 'salaried_employee',
  'Daily wage / gig worker': 'daily_wage_gig_worker',
  'Business owner': 'business_owner',
};

export const PERSONA_DB_TO_LABEL = Object.fromEntries(
  Object.entries(PERSONA_LABEL_TO_DB).map(([k, v]) => [v, k])
);
