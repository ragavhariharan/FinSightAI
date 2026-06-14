import { supabase } from '../supabase';
import { PERSONA_LABEL_TO_DB } from '../supabase';
import { ensureSnapshot } from './dashboard';

export async function completeOnboarding(userId, personaLabel) {
  const personaDb = PERSONA_LABEL_TO_DB[personaLabel] || 'salaried_employee';
  await supabase.from('profiles').update({
    onboarding_status: 'complete',
    persona: personaDb,
  }).eq('id', userId);

  await ensureSnapshot();
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
