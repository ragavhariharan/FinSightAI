import { supabase } from '../supabase';
import { PERSONA_LABEL_TO_DB } from '../supabase';
import { seedBudgetsFromPersona } from './budgets';
import { ensureSnapshot } from './dashboard';

export async function completeOnboarding(userId, personaLabel) {
  const personaDb = PERSONA_LABEL_TO_DB[personaLabel] || 'salaried_employee';
  await supabase.from('profiles').update({
    onboarding_status: 'complete',
    persona: personaDb,
  }).eq('id', userId);

  await seedBudgetsFromPersona(personaDb);
  await ensureSnapshot();
}

export async function skipToChat(userId) {
  await supabase.from('profiles').update({
    onboarding_status: 'chat_in_progress',
    onboarding_data_path: 'skip',
  }).eq('id', userId);
}

export async function markUploadPath(userId) {
  await supabase.from('profiles').update({
    onboarding_status: 'upload_complete',
    onboarding_data_path: 'upload',
  }).eq('id', userId);
}

export async function fetchPersonaQuestions(personaLabel) {
  const personaDb = PERSONA_LABEL_TO_DB[personaLabel] || 'salaried_employee';
  const { data, error } = await supabase
    .from('persona_config')
    .select('onboarding_questions')
    .eq('persona', personaDb)
    .single();
  if (error) throw error;
  return data?.onboarding_questions || [];
}

/** Restore in-progress onboarding chat after reload */
export async function fetchOnboardingState() {
  const { data, error } = await supabase
    .from('onboarding_chat_messages')
    .select('role, content, question_index')
    .order('created_at', { ascending: true });
  if (error) throw error;
  const rows = data || [];
  return {
    messages: rows.map(m => ({ role: m.role === 'assistant' ? 'ai' : 'user', text: m.content })),
    questionIndex: rows.filter(m => m.role === 'user').length,
  };
}
