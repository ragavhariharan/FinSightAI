-- FinSight AI — Person 1: enums + profiles
-- Run in Supabase SQL Editor (in order: 001 → 004)

create type public.persona_type as enum (
  'student',
  'salaried_employee',
  'daily_wage_gig_worker',
  'business_owner'
);

create type public.onboarding_status as enum (
  'not_started',
  'mcq_in_progress',
  'mcq_complete',
  'data_choice_pending',
  'upload_complete',
  'chat_in_progress',
  'chat_complete',
  'complete'
);

create type public.profile_field_source as enum (
  'conversation',
  'upload',
  'manual',
  'mcq',
  'system_default'
);

create type public.spending_type as enum (
  'routine',
  'flexible',
  'impulse'
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text,
  persona public.persona_type,
  onboarding_status public.onboarding_status not null default 'not_started',
  onboarding_data_path text check (onboarding_data_path in ('skip', 'upload', 'demo')),
  mcq_answers jsonb not null default '{}',
  is_demo boolean not null default false,
  avatar_initials text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text;
  v_initials text;
begin
  v_name := coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1));
  v_initials := upper(left(regexp_replace(v_name, '\s+.*', ''), 1) || left(regexp_replace(v_name, '^.*\s', ''), 1));
  if length(v_initials) < 2 then
    v_initials := upper(left(v_name, 2));
  end if;

  insert into public.profiles (id, email, full_name, avatar_initials, onboarding_status)
  values (new.id, new.email, v_name, v_initials, 'not_started');

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();
