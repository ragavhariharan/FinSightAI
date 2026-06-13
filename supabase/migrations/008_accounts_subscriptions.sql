-- Bank accounts + user subscription tracking

create table public.bank_accounts (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  institution text,
  balance numeric not null default 0,
  is_default boolean not null default false,
  color text not null default '#1F7A5E',
  created_at timestamptz not null default now()
);

create table public.user_subscriptions (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  service text not null,
  category text not null default 'Entertainment',
  plan text,
  amount numeric,
  billing_cycle text not null default 'monthly',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (user_id, service)
);

create index bank_accounts_user_idx on public.bank_accounts (user_id);
create index user_subscriptions_user_idx on public.user_subscriptions (user_id);

alter table public.bank_accounts enable row level security;
alter table public.user_subscriptions enable row level security;

create policy "bank_accounts_all_own" on public.bank_accounts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "user_subscriptions_all_own" on public.user_subscriptions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table public.savings_goals add column if not exists target_years int default 2;
alter table public.savings_goals add column if not exists target_date date;
alter table public.savings_goals add column if not exists target_days int;
