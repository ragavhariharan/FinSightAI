-- Real spending DNA + leak detection in dashboard snapshot

create or replace function public.recompute_dashboard_snapshot(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_month date := date_trunc('month', current_date)::date;
  v_prev_month date := (date_trunc('month', current_date) - interval '1 month')::date;
  v_income numeric := 0;
  v_spend numeric := 0;
  v_prev_spend numeric := 0;
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
  v_routine numeric := 0;
  v_flexible numeric := 0;
  v_impulse numeric := 0;
  v_dna_total numeric := 0;
  v_routine_pct int := 0;
  v_flexible_pct int := 0;
  v_impulse_pct int := 0;
  v_spend_vs_last numeric := 0;
  v_savings_vs_last numeric := 0;
  v_prev_income numeric := 0;
  v_prev_savings numeric := 0;
begin
  select coalesce(sum(amount), 0) into v_income
  from public.transactions
  where user_id = p_user_id and date_trunc('month', txn_date) = v_month and amount > 0;

  select coalesce(sum(abs(amount)), 0) into v_spend
  from public.transactions
  where user_id = p_user_id and date_trunc('month', txn_date) = v_month and amount < 0;

  select coalesce(sum(abs(amount)), 0) into v_prev_spend
  from public.transactions
  where user_id = p_user_id and date_trunc('month', txn_date) = v_prev_month and amount < 0;

  select coalesce(sum(amount), 0) into v_prev_income
  from public.transactions
  where user_id = p_user_id and date_trunc('month', txn_date) = v_prev_month and amount > 0;

  v_prev_savings := v_prev_income - v_prev_spend;
  v_savings := v_income - v_spend;
  if v_income > 0 then v_rate := round((v_savings / v_income) * 100, 1); end if;
  if v_prev_spend > 0 then v_spend_vs_last := round(((v_spend - v_prev_spend) / v_prev_spend) * 100, 1); end if;
  if v_prev_savings <> 0 then v_savings_vs_last := round(((v_savings - v_prev_savings) / abs(v_prev_savings)) * 100, 1); end if;

  select count(*), coalesce(max(abs(amount)), 0) into v_tx_count, v_largest
  from public.transactions
  where user_id = p_user_id and date_trunc('month', txn_date) = v_month and amount < 0;

  select coalesce(sum(limit_amount), 0) into v_budget_limit
  from public.budgets where user_id = p_user_id and month = v_month;

  if v_budget_limit > 0 then v_budget_used := round((v_spend / v_budget_limit) * 100, 1); end if;

  v_health := least(100, greatest(0, 50 + (v_rate::int / 2) - case when v_budget_used > 100 then 15 when v_budget_used > 90 then 8 else 0 end));

  select persona, full_name into v_persona, v_name from public.profiles where id = p_user_id;

  select coalesce(sum(abs(amount)), 0) into v_routine
  from public.transactions
  where user_id = p_user_id and date_trunc('month', txn_date) = v_month and amount < 0
    and category in ('Housing', 'Utilities', 'Insurance', 'Groceries', 'Health');

  select coalesce(sum(abs(amount)), 0) into v_flexible
  from public.transactions
  where user_id = p_user_id and date_trunc('month', txn_date) = v_month and amount < 0
    and category in ('Food & Dining', 'Transport', 'Fitness');

  select coalesce(sum(abs(amount)), 0) into v_impulse
  from public.transactions
  where user_id = p_user_id and date_trunc('month', txn_date) = v_month and amount < 0
    and category in ('Shopping', 'Entertainment', 'Other');

  v_dna_total := v_routine + v_flexible + v_impulse;
  if v_dna_total > 0 then
    v_routine_pct := round((v_routine / v_dna_total) * 100);
    v_flexible_pct := round((v_flexible / v_dna_total) * 100);
    v_impulse_pct := greatest(0, 100 - v_routine_pct - v_flexible_pct);
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'name', category,
    'amount', cat_total,
    'color', case category
      when 'Housing' then '#0EA5E9' when 'Food & Dining' then '#F59E0B' when 'Groceries' then '#F59E0B'
      when 'Shopping' then '#EC4899' when 'Utilities' then '#6366F1' when 'Insurance' then '#6366F1'
      when 'Transport' then '#8B5CF6' when 'Health' then '#EF4444' when 'Fitness' then '#EF4444'
      else '#6B7280' end,
    'pct', round((cat_total / nullif(v_spend, 0)) * 100, 1)
  ) order by cat_total desc), '[]'::jsonb)
  into v_donut
  from (
    select category, sum(abs(amount)) as cat_total
    from public.transactions
    where user_id = p_user_id and date_trunc('month', txn_date) = v_month and amount < 0
    group by category
  ) c;

  -- Leaks: categories up >25% vs prior month
  select coalesce(jsonb_agg(jsonb_build_object(
    'title', format('%s up %s%%', cur.category, round(((cur.total - coalesce(prev.total, 0)) / nullif(coalesce(prev.total, cur.total), 0)) * 100)),
    'detail', format('%s · ₹%s this month vs ₹%s last month', cur.category, to_char(cur.total, 'FM999,999'), to_char(coalesce(prev.total, 0), 'FM999,999')),
    'delta', round(cur.total - coalesce(prev.total, 0))
  )), '[]'::jsonb)
  into v_leaks
  from (
    select category, sum(abs(amount)) as total
    from public.transactions
    where user_id = p_user_id and date_trunc('month', txn_date) = v_month and amount < 0
    group by category
  ) cur
  left join (
    select category, sum(abs(amount)) as total
    from public.transactions
    where user_id = p_user_id and date_trunc('month', txn_date) = v_prev_month and amount < 0
    group by category
  ) prev on prev.category = cur.category
  where coalesce(prev.total, 0) > 0
    and cur.total > prev.total * 1.25
  limit 5;

  v_forecast_points := (
    select coalesce(jsonb_agg(round(v_savings * (i::numeric / 29), 0) order by i), '[]'::jsonb)
    from generate_series(0, 29) i
  );

  v_snapshot := jsonb_build_object(
    'briefing', case when v_tx_count = 0 then
      format('Welcome back%s! Log transactions to unlock your personalised dashboard.', case when v_name is not null then ', ' || split_part(v_name, ' ', 1) else '' end)
    else format(
      'You are on track to save ₹%s this month%s. %s spending so far is ₹%s across %s transactions.',
      to_char(v_savings, 'FM999,999,999'),
      case when v_income > 0 then format(' — %s%% of take-home', v_rate) else '' end,
      coalesce(v_name, 'You'), to_char(v_spend, 'FM999,999,999'), v_tx_count
    ) end,
    'health_score', v_health,
    'health_label', case when v_health >= 70 then 'Good standing' when v_health >= 50 then 'Fair' else 'Needs attention' end,
    'health_notes', case when v_rate >= 20 then 'Strong savings rate' when v_budget_used > 90 then 'Budget nearly exhausted' else 'Based on your current spending patterns' end,
    'monthly_income', v_income, 'monthly_spend', v_spend, 'net_savings', v_savings, 'savings_rate_pct', v_rate,
    'total_budget_limit', v_budget_limit, 'budget_used_pct', v_budget_used,
    'spend_vs_last_month_pct', v_spend_vs_last, 'savings_vs_last_month_pct', v_savings_vs_last,
    'spending_dna', jsonb_build_object(
      'routine', jsonb_build_object('pct', v_routine_pct, 'sub', 'Housing, utilities, groceries, insurance'),
      'flexible', jsonb_build_object('pct', v_flexible_pct, 'sub', 'Food, transport, fitness'),
      'impulse', jsonb_build_object('pct', v_impulse_pct, 'sub', 'Shopping, entertainment, other')
    ),
    'forecast', jsonb_build_object('projected_savings', v_savings, 'points', v_forecast_points),
    'leaks', v_leaks, 'donut_segments', v_donut,
    'transaction_count', v_tx_count, 'largest_expense', v_largest, 'persona', v_persona
  );

  insert into public.dashboard_snapshots (user_id, period_month, snapshot, computed_at)
  values (p_user_id, v_month, v_snapshot, now())
  on conflict (user_id) do update set period_month = excluded.period_month, snapshot = excluded.snapshot, computed_at = excluded.computed_at;
end;
$$;

-- Allow service role / edge functions to refresh news cache
create policy "news_cache_service_write" on public.news_cache for all using (auth.role() = 'service_role');
