import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const MODEL = 'openai/gpt-oss-120b:free';
const PERSONA_MAP: Record<string, string> = {
  'Student': 'student',
  'Salaried employee': 'salaried_employee',
  'Daily wage / gig worker': 'daily_wage_gig_worker',
  'Business owner': 'business_owner',
};

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing auth');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const { message, question_index = 0, persona_label = 'Salaried employee' } = await req.json();
    const personaDb = PERSONA_MAP[persona_label] || 'salaried_employee';

    const { data: config } = await supabase.from('persona_config').select('onboarding_questions, system_prompt_fragment').eq('persona', personaDb).single();
    const questions: string[] = config?.onboarding_questions || [];
    const nextIndex = question_index + 1;
    const isComplete = nextIndex >= questions.length;

    const key = Deno.env.get('OPENROUTER_API_KEY');
    if (!key) throw new Error('OPENROUTER_API_KEY not set');

    const system = `${config?.system_prompt_fragment || ''} Extract financial profile fields from user answers into extracted_fields object with keys like monthly_income, income_frequency, fixed_commitments, savings_goal_description. Respond JSON: {"reply":"your next question or closing message","extracted_fields":{}}`;

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: `Question was: ${questions[question_index] || 'intro'}. User answered: ${message}. Next question index: ${nextIndex}. Questions left: ${isComplete ? 0 : questions.length - nextIndex}` },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    const json = await res.json();
    const parsed = JSON.parse(json.choices?.[0]?.message?.content || '{}');

    for (const [field_key, value] of Object.entries(parsed.extracted_fields || {})) {
      const num = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.-]/g, ''));
      await supabase.from('profile_fields').upsert({
        user_id: user.id,
        field_key,
        value_text: String(value),
        value_numeric: Number.isNaN(num) ? null : num,
        source: 'conversation',
      }, { onConflict: 'user_id,field_key' });
    }

    const reply = parsed.reply || (isComplete ? 'Perfect! Setting up your dashboard...' : questions[nextIndex]);

    return new Response(JSON.stringify({
      reply,
      question_index: nextIndex,
      is_complete: isComplete,
      extracted_fields: parsed.extracted_fields || {},
    }), { headers: { ...cors, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e.message || e) }), {
      status: 400,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }
});
