-- FinSight — feature tables for investments, insights, goals

create table public.stock_holdings (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  symbol text not null,
  name text not null,
  exchange text not null default 'NSE',
  qty numeric not null check (qty > 0),
  avg_price numeric not null check (avg_price >= 0),
  created_at timestamptz not null default now(),
  unique (user_id, symbol, exchange)
);

create table public.mutual_fund_holdings (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  isin text,
  scheme_code text,
  units numeric not null check (units > 0),
  invested numeric not null check (invested >= 0),
  benchmark text default 'Nifty 50',
  created_at timestamptz not null default now()
);

create table public.sip_goals (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  target numeric not null check (target > 0),
  years int not null check (years > 0),
  saved numeric not null default 0,
  monthly_sip numeric,
  category text,
  created_at timestamptz not null default now()
);

create table public.net_worth_items (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  item_type text not null check (item_type in ('asset', 'liability')),
  label text not null,
  amount numeric not null,
  created_at timestamptz not null default now()
);

create table public.tax_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  annual_income numeric not null default 0,
  investments_80c numeric not null default 0,
  health_insurance_80d numeric not null default 0,
  home_loan_interest numeric not null default 0,
  nps_80ccd numeric not null default 0,
  updated_at timestamptz not null default now()
);

create table public.bill_splits (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  total numeric not null check (total > 0),
  paid_by text not null default 'You',
  split_date date not null default current_date,
  members jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create table public.spending_challenges (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text,
  challenge_type text not null default 'custom',
  target numeric not null,
  unit text not null default '₹',
  status text not null default 'active' check (status in ('active', 'paused', 'completed')),
  created_at timestamptz not null default now()
);

create table public.savings_goals (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  target numeric not null check (target > 0),
  icon text not null default 'goals',
  color text not null default '#1F7A5E',
  goal_key text,
  created_at timestamptz not null default now()
);

-- Global news cache (edge function refreshes; no API key)
create table public.news_cache (
  id int primary key default 1 check (id = 1),
  items jsonb not null default '[]',
  fetched_at timestamptz not null default now()
);

insert into public.news_cache (id, items) values (1, '[]') on conflict (id) do nothing;

create index stock_holdings_user_idx on public.stock_holdings (user_id);
create index mutual_fund_holdings_user_idx on public.mutual_fund_holdings (user_id);
create index sip_goals_user_idx on public.sip_goals (user_id);
create index net_worth_items_user_idx on public.net_worth_items (user_id);
create index bill_splits_user_idx on public.bill_splits (user_id);
create index spending_challenges_user_idx on public.spending_challenges (user_id);
create index savings_goals_user_idx on public.savings_goals (user_id);

alter table public.stock_holdings enable row level security;
alter table public.mutual_fund_holdings enable row level security;
alter table public.sip_goals enable row level security;
alter table public.net_worth_items enable row level security;
alter table public.tax_profiles enable row level security;
alter table public.bill_splits enable row level security;
alter table public.spending_challenges enable row level security;
alter table public.savings_goals enable row level security;
alter table public.news_cache enable row level security;

create policy "stock_holdings_all_own" on public.stock_holdings for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "mutual_fund_holdings_all_own" on public.mutual_fund_holdings for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "sip_goals_all_own" on public.sip_goals for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "net_worth_items_all_own" on public.net_worth_items for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "tax_profiles_all_own" on public.tax_profiles for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "bill_splits_all_own" on public.bill_splits for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "spending_challenges_all_own" on public.spending_challenges for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "savings_goals_all_own" on public.savings_goals for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "news_cache_read" on public.news_cache for select using (auth.role() = 'authenticated');
