-- budgets_with_spent must run as the querying user so RLS on budgets/transactions applies

drop view if exists public.budgets_with_spent;

create view public.budgets_with_spent
with (security_invoker = true)
as
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

grant select on public.budgets_with_spent to authenticated;
