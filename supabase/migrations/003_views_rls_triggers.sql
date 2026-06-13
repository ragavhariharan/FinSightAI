-- FinSight AI — Person 1: RLS, views, recompute, triggers

-- Budget spent computed from transactions (current month match on budgets.month)
create or replace view public.budgets_with_spent as
select
  b.id,
  b.user_id,
  b.category,
  b.icon,
  b.color,
  b.limit_amount,
  b.month,
  coalesce(
    sum(case when t.amount < 0 then abs(t.amount) else 0 end),
    0
  ) as spent
from public.budgets b
left join public.transactions t
  on t.user_id = b.user_id
  and t.category = b.category
  and date_trunc('month', t.txn_date) = date_trunc('month', b.month)
group by b.id, b.user_id, b.category, b.icon, b.color, b.limit_amount, b.month;

-- Recompute dashboard snapshot for one user
create or replace function public.recompute_dashboard_snapshot(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_month date := date_trunc('month', current_date)::date;
  v_income numeric := 0;
  v_spend numeric := 0;
  v_savings numeric := 0;
  v_rate numeric := 0;
  v_health int := 50;
  v_persona public.persona_type;
  v_name text;
  v_snapshot jsonb;
  v_donut jsonb := '[]'::jsonb;
  v_leaks jsonb := '[]'::jsonb;
  v_forecast_points jsonb := '[]'::jsonb;
  v_tx_count int := 0;
  v_largest numeric := 0;
  v_budget_limit numeric := 0;
  v_budget_used numeric := 0;
begin
  select coalesce(sum(amount), 0) into v_income
  from public.transactions
  where user_id = p_user_id
    and date_trunc('month', txn_date) = v_month
    and amount > 0;

  select coalesce(sum(abs(amount)), 0) into v_spend
  from public.transactions
  where user_id = p_user_id
    and date_trunc('month', txn_date) = v_month
    and amount < 0;

  v_savings := v_income - v_spend;
  if v_income > 0 then
    v_rate := round((v_savings / v_income) * 100, 1);
  end if;

  select count(*), coalesce(max(abs(amount)), 0)
  into v_tx_count, v_largest
  from public.transactions
  where user_id = p_user_id
    and date_trunc('month', txn_date) = v_month
    and amount < 0;

  select coalesce(sum(limit_amount), 0) into v_budget_limit
  from public.budgets
  where user_id = p_user_id and month = v_month;

  if v_budget_limit > 0 then
    v_budget_used := round((v_spend / v_budget_limit) * 100, 1);
  end if;

  v_health := least(100, greatest(0, 50 + (v_rate::int / 2)));

  select persona, full_name into v_persona, v_name
  from public.profiles where id = p_user_id;

  select coalesce(jsonb_agg(jsonb_build_object(
    'name', category,
    'amount', cat_total,
    'color', case category
      when 'Housing' then '#0EA5E9'
      when 'Food & Dining' then '#F59E0B'
      when 'Groceries' then '#F59E0B'
      when 'Shopping' then '#EC4899'
      when 'Utilities' then '#6366F1'
      when 'Insurance' then '#6366F1'
      when 'Transport' then '#8B5CF6'
      when 'Health' then '#EF4444'
      when 'Fitness' then '#EF4444'
      else '#6B7280'
    end,
    'pct', round((cat_total / nullif(v_spend, 0)) * 100, 1)
  ) order by cat_total desc), '[]'::jsonb)
  into v_donut
  from (
    select category, sum(abs(amount)) as cat_total
    from public.transactions
    where user_id = p_user_id
      and date_trunc('month', txn_date) = v_month
      and amount < 0
    group by category
  ) c;

  v_forecast_points := (
    select coalesce(jsonb_agg(round(v_savings * (i::numeric / 29), 0) order by i), '[]'::jsonb)
    from generate_series(0, 29) i
  );

  v_snapshot := jsonb_build_object(
    'briefing', format(
      'You are on track to save ₹%s this month%s. %s spending so far is ₹%s across %s transactions.',
      to_char(v_savings, 'FM999,999,999'),
      case when v_income > 0 then format(' — %s%% of take-home', v_rate) else '' end,
      coalesce(v_name, 'You'),
      to_char(v_spend, 'FM999,999,999'),
      v_tx_count
    ),
    'health_score', v_health,
    'health_label', case when v_health >= 70 then 'Good standing' when v_health >= 50 then 'Fair' else 'Needs attention' end,
    'health_notes', 'Based on your current savings rate and spending patterns.',
    'monthly_income', v_income,
    'monthly_spend', v_spend,
    'net_savings', v_savings,
    'savings_rate_pct', v_rate,
    'total_budget_limit', v_budget_limit,
    'budget_used_pct', v_budget_used,
    'spend_vs_last_month_pct', 0,
    'savings_vs_last_month_pct', 0,
    'spending_dna', jsonb_build_object(
      'routine', jsonb_build_object('pct', 55, 'sub', 'EMI, utilities, groceries'),
      'flexible', jsonb_build_object('pct', 30, 'sub', 'Food delivery, transport, health'),
      'impulse', jsonb_build_object('pct', 15, 'sub', 'Shopping, leisure, dining out')
    ),
    'forecast', jsonb_build_object(
      'projected_savings', v_savings,
      'points', v_forecast_points
    ),
    'leaks', v_leaks,
    'donut_segments', v_donut,
    'transaction_count', v_tx_count,
    'largest_expense', v_largest,
    'persona', v_persona
  );

  insert into public.dashboard_snapshots (user_id, period_month, snapshot, computed_at)
  values (p_user_id, v_month, v_snapshot, now())
  on conflict (user_id) do update set
    period_month = excluded.period_month,
    snapshot = excluded.snapshot,
    computed_at = excluded.computed_at;
end;
$$;

create or replace function public.trigger_recompute_snapshot()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.recompute_dashboard_snapshot(coalesce(new.user_id, old.user_id));
  return coalesce(new, old);
end;
$$;

drop trigger if exists transactions_recompute_snapshot on public.transactions;
create trigger transactions_recompute_snapshot
  after insert or update or delete on public.transactions
  for each row execute function public.trigger_recompute_snapshot();

-- RLS
alter table public.profiles enable row level security;
alter table public.profile_fields enable row level security;
alter table public.transactions enable row level security;
alter table public.budgets enable row level security;
alter table public.dashboard_snapshots enable row level security;
alter table public.onboarding_chat_messages enable row level security;
alter table public.copilot_messages enable row level security;
alter table public.pending_ai_actions enable row level security;
alter table public.statement_uploads enable row level security;
alter table public.persona_config enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

create policy "profile_fields_all_own" on public.profile_fields for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "transactions_all_own" on public.transactions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "budgets_all_own" on public.budgets for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "dashboard_snapshots_all_own" on public.dashboard_snapshots for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "onboarding_chat_all_own" on public.onboarding_chat_messages for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "copilot_messages_all_own" on public.copilot_messages for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "pending_ai_actions_all_own" on public.pending_ai_actions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "statement_uploads_all_own" on public.statement_uploads for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "persona_config_read" on public.persona_config for select using (auth.role() = 'authenticated');

grant select on public.budgets_with_spent to authenticated;
