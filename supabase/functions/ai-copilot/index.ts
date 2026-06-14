import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const MODEL = 'openai/gpt-oss-120b:free';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function callOpenRouter(system: string, messages: { role: string; content: string }[]) {
  const key = Deno.env.get('OPENROUTER_API_KEY');
  if (!key) throw new Error('OPENROUTER_API_KEY not set');

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://finsight.app',
      'X-Title': 'FinSight Kash',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'system', content: system }, ...messages],
      response_format: { type: 'json_object' },
    }),
  });

  const json = await res.json();
  const content = json.choices?.[0]?.message?.content || '{}';
  return JSON.parse(content);
}

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

    const { message } = await req.json();
    if (!message) throw new Error('message required');

    const [{ data: profile }, { data: snapshotRow }, { data: transactions }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('dashboard_snapshots').select('snapshot').eq('user_id', user.id).maybeSingle(),
      supabase.from('transactions').select('name, amount, category, txn_date').eq('user_id', user.id).order('txn_date', { ascending: false }).limit(20),
    ]);

    const snap = snapshotRow?.snapshot || {};
    const system = `You are Kash, the personal finance assistant for FinSight (India). User persona: ${profile?.persona || 'salaried_employee'}.
Current snapshot: ${JSON.stringify(snap)}
Recent transactions: ${JSON.stringify(transactions || [])}
Respond in JSON only: {"reply":"natural language","actions":[{"type":"create_transaction","requires_confirmation":false,"data":{"name":"","amount":-500,"category":"Groceries","txn_date":"YYYY-MM-DD"}}]}
Use negative amount for expenses, positive for income. Only include actions when user logs or updates money. For questions, actions can be [].`;

    const parsed = await callOpenRouter(system, [{ role: 'user', content: message }]);
    let created_tx = false;

    for (const action of parsed.actions || []) {
      if (action.type === 'create_transaction' && action.data) {
        const { error } = await supabase.from('transactions').insert({
          user_id: user.id,
          name: action.data.name,
          amount: action.data.amount,
          category: action.data.category || 'Other',
          txn_date: action.data.txn_date || new Date().toISOString().slice(0, 10),
          emoji: action.data.emoji || '💰',
          account: action.data.account || 'Main',
          source: 'chat',
        });
        if (!error) created_tx = true;
      }
    }

    if (created_tx) {
      await supabase.rpc('recompute_dashboard_snapshot', { p_user_id: user.id });
    }

    const { data: freshSnap } = await supabase.from('dashboard_snapshots').select('snapshot').eq('user_id', user.id).maybeSingle();

    return new Response(JSON.stringify({
      reply: parsed.reply || 'Done.',
      created_tx,
      snapshot: freshSnap?.snapshot || snap,
      actions_executed: parsed.actions || [],
    }), { headers: { ...cors, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e.message || e) }), {
      status: 400,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }
});
