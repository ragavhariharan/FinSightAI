import { supabase } from '../supabase';
import { insertTransaction } from './transactions';
import { ensureSnapshot } from './dashboard';
import { formatRupee } from '../format';

const MODEL = 'openai/gpt-oss-120b:free';

export function parseTransactionFromText(text) {
  const lower = text.toLowerCase();
  const amountMatch = text.match(/₹\s*([\d,]+(?:\.\d+)?)|(?:spent|paid|bought|got).*?([\d,]+(?:\.\d+)?)\s*(?:rs|rupees|₹)?/i);
  const raw = amountMatch ? (amountMatch[1] || amountMatch[2] || '').replace(/,/g, '') : null;
  if (!raw) return null;

  const amount = parseFloat(raw);
  if (!amount || Number.isNaN(amount)) return null;

  const isIncome = /(?:got paid|received|salary|income|earned)/i.test(text);
  const categories = [
    { keys: ['grocery', 'groceries', 'bigbazaar'], cat: 'Groceries', emoji: '🛒' },
    { keys: ['swiggy', 'zomato', 'food', 'lunch', 'dinner', 'chai', 'coffee'], cat: 'Food & Dining', emoji: '🍔' },
    { keys: ['uber', 'ola', 'rapido', 'petrol', 'transport'], cat: 'Transport', emoji: '🚗' },
    { keys: ['amazon', 'myntra', 'shopping'], cat: 'Shopping', emoji: '🛍' },
    { keys: ['rent', 'emi', 'housing'], cat: 'Housing', emoji: '🏠' },
    { keys: ['netflix', 'movie'], cat: 'Entertainment', emoji: '🎬' },
    { keys: ['salary', 'paycheck', 'paid'], cat: 'Paychecks', emoji: '💼' },
  ];

  let category = 'Other', emoji = '💰';
  for (const c of categories) {
    if (c.keys.some(k => lower.includes(k))) {
      category = c.cat;
      emoji = c.emoji;
      break;
    }
  }

  const name = text.slice(0, 60).trim() || category;
  return {
    name: name.charAt(0).toUpperCase() + name.slice(1),
    amount: isIncome ? amount : -Math.abs(amount),
    category,
    emoji,
  };
}

export function localCopilotReply(text, snapshot) {
  const ql = text.toLowerCase();
  const snap = snapshot || {};
  const spend = snap.monthly_spend || 0;
  const income = snap.monthly_income || 0;
  const savings = snap.net_savings || 0;
  const rate = snap.savings_rate_pct || 0;
  const health = snap.health_score || 50;

  if (ql.includes('health') || ql.includes('score')) {
    return `Your Financial Health Score is ${health}/100. ${snap.health_notes || 'Keep tracking your spending to improve it.'}`;
  }
  if (ql.includes('cut') || ql.includes('reduce') || ql.includes('save')) {
    return `You're spending ${formatRupee(spend)} this month with a ${rate}% savings rate. Review your top categories in Reports and trim discretionary spends like food delivery or shopping.`;
  }
  if (ql.includes('forecast') || ql.includes('project')) {
    return `At your current pace you'll save about ${formatRupee(savings)} this month (${rate}% of ${formatRupee(income)} income).`;
  }
  if (ql.includes('afford') || ql.includes('can i buy')) {
    const m = text.match(/₹\s*([\d,]+)/);
    const cost = m ? parseFloat(m[1].replace(/,/g, '')) : 15000;
    const after = savings - cost;
    return `A one-time ${formatRupee(cost)} purchase would leave about ${formatRupee(after)} saved this month. ${after >= 0 ? 'Your budget can absorb it.' : 'That would exceed your current savings pace.'}`;
  }
  return snap.briefing || `You're tracking ${formatRupee(spend)} in spending this month. Ask me about cuts, forecasts, or log a transaction like "I spent ₹500 on groceries".`;
}

/** Client-side copilot for demo mode or edge function fallback */
export function getLocalCopilotResponse(text, snapshot) {
  const tx = parseTransactionFromText(text);
  if (tx) {
    return {
      reply: `Got it — logged ${formatRupee(tx.amount, { signed: true })} for ${tx.name}. Your dashboard has been updated.`,
      createdTx: true,
      tx,
    };
  }
  return { reply: localCopilotReply(text, snapshot), createdTx: false, tx: null };
}

export async function fetchCopilotMessages() {
  const { data, error } = await supabase
    .from('copilot_messages')
    .select('role, content')
    .order('created_at', { ascending: true })
    .limit(50);
  if (error) throw error;
  return (data || []).map(m => ({ role: m.role === 'assistant' ? 'ai' : 'user', text: m.content }));
}

async function saveCopilotMessage(role, content, actions_executed = null) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from('copilot_messages').insert({
    user_id: user.id,
    role: role === 'ai' ? 'assistant' : 'user',
    content,
    actions_executed,
  });
}

export async function sendCopilotMessage(text, snapshot) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  await saveCopilotMessage('user', text);

  // Try edge function first
  try {
    const { data, error } = await supabase.functions.invoke('ai-copilot', {
      body: { message: text, mode: 'default' },
    });
    if (!error && data?.reply) {
      await saveCopilotMessage('ai', data.reply, data.actions_executed || null);
      if (data.snapshot) return { reply: data.reply, snapshot: data.snapshot, createdTx: data.created_tx || false };
      const fresh = await ensureSnapshot();
      return { reply: data.reply, snapshot: fresh, createdTx: !!data.created_tx };
    }
  } catch {
    /* fall through to local */
  }

  const { reply, createdTx, tx } = getLocalCopilotResponse(text, snapshot);
  if (createdTx && tx) await insertTransaction({ ...tx, source: 'chat' });

  await saveCopilotMessage('ai', reply, createdTx ? [{ type: 'create_transaction' }] : null);
  const freshSnapshot = createdTx ? await ensureSnapshot() : snapshot;
  return { reply, snapshot: freshSnapshot, createdTx };
}

export async function sendOnboardingMessage(text, questionIndex, personaLabel) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  await supabase.from('onboarding_chat_messages').insert({
    user_id: user.id,
    role: 'user',
    content: text,
    question_index: questionIndex,
  });

  try {
    const { data, error } = await supabase.functions.invoke('ai-onboarding', {
      body: { message: text, question_index: questionIndex, persona_label: personaLabel },
    });
    if (!error && data?.reply) {
      await supabase.from('onboarding_chat_messages').insert({
        user_id: user.id,
        role: 'assistant',
        content: data.reply,
        question_index: data.question_index ?? questionIndex + 1,
        extracted_fields: data.extracted_fields || null,
      });
      return data;
    }
  } catch {
    /* fall through */
  }

  return null;
}
