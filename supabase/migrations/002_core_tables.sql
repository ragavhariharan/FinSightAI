-- FinSight AI — Person 1: core tables

create table public.persona_config (
  persona public.persona_type primary key,
  display_label text not null,
  onboarding_questions jsonb not null default '[]',
  system_prompt_fragment text not null default '',
  dashboard_framing jsonb not null default '{}',
  default_budget_template jsonb not null default '[]',
  dna_category_hints jsonb not null default '{}'
);

create table public.profile_fields (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  field_key text not null,
  value_text text,
  value_numeric numeric,
  value_json jsonb,
  source public.profile_field_source not null default 'conversation',
  confidence numeric(3, 2),
  updated_at timestamptz not null default now(),
  unique (user_id, field_key)
);

create table public.transactions (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  txn_date date not null default current_date,
  name text not null,
  category text not null,
  emoji text not null default '💰',
  account text not null default 'Main',
  amount numeric not null,
  spending_type public.spending_type,
  source text not null default 'manual' check (source in ('manual', 'chat', 'upload', 'seed')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index transactions_user_date_idx on public.transactions (user_id, txn_date desc);
create index transactions_user_category_idx on public.transactions (user_id, category);

create table public.budgets (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  category text not null,
  icon text,
  color text,
  limit_amount numeric not null,
  month date not null,
  created_at timestamptz not null default now(),
  unique (user_id, category, month)
);

create table public.dashboard_snapshots (
  user_id uuid primary key references auth.users (id) on delete cascade,
  period_month date not null,
  snapshot jsonb not null default '{}',
  computed_at timestamptz not null default now()
);

create table public.onboarding_chat_messages (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  question_index int not null default 0,
  extracted_fields jsonb,
  created_at timestamptz not null default now()
);

create table public.copilot_messages (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  actions_executed jsonb,
  created_at timestamptz not null default now()
);

create table public.pending_ai_actions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  action_type text not null,
  payload jsonb not null,
  summary text not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled', 'expired')),
  expires_at timestamptz not null default (now() + interval '30 minutes'),
  created_at timestamptz not null default now()
);

create table public.statement_uploads (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  storage_path text not null,
  file_name text not null,
  parse_status text not null default 'pending' check (parse_status in ('pending', 'parsed', 'failed')),
  rows_imported int not null default 0,
  error_message text,
  created_at timestamptz not null default now()
);

create trigger transactions_updated_at
  before update on public.transactions
  for each row execute function public.set_updated_at();

create trigger profile_fields_updated_at
  before update on public.profile_fields
  for each row execute function public.set_updated_at();
