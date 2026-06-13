-- FinSight AI — Person 1: seed persona_config (matches context.jsx PERSONA_SCRIPTS)

insert into public.persona_config (persona, display_label, onboarding_questions, system_prompt_fragment, default_budget_template) values
(
  'salaried_employee',
  'Salaried employee',
  '[
    "Hi! I am FinSight. Let''s build your financial picture. What''s your monthly take-home salary after tax?",
    "Got it. What are your fixed monthly commitments — rent, home loan EMI, or insurance?",
    "How much do you typically spend on food and groceries each month?",
    "Do you have any savings goals right now — an emergency fund, a big purchase, or retirement?",
    "Last one: roughly what percentage of your income do you manage to save each month?"
  ]'::jsonb,
  'User is a salaried employee with fixed monthly income. Use clear, friendly language. Emphasize EMI burden, savings rate, and budget discipline. Avoid jargon.',
  '[
    {"category":"Housing","icon":"🏠","color":"#0EA5E9","limit_amount":26000},
    {"category":"Food & Dining","icon":"🍔","color":"#F59E0B","limit_amount":9000},
    {"category":"Shopping","icon":"🛍","color":"#EC4899","limit_amount":7000},
    {"category":"Utilities & Insurance","icon":"⚡","color":"#6366F1","limit_amount":10000},
    {"category":"Transport","icon":"🚗","color":"#8B5CF6","limit_amount":4000},
    {"category":"Health & Fitness","icon":"💪","color":"#EF4444","limit_amount":3000}
  ]'::jsonb
),
(
  'student',
  'Student',
  '[
    "Hi! I am FinSight. Let''s set up your profile. What''s your monthly allowance or part-time income?",
    "What are your biggest regular expenses — food delivery, rent, subscriptions?",
    "Do you have any regular bills you pay yourself, like your phone or internet?",
    "Any savings goals, even small ones — like building an emergency fund?",
    "Do you have any loans or credit card debt right now?"
  ]'::jsonb,
  'User is a student with irregular or allowance-based income. Keep language simple. Focus on discretionary spend, subscriptions, and small savings habits.',
  '[
    {"category":"Food & Dining","icon":"🍔","color":"#F59E0B","limit_amount":5000},
    {"category":"Groceries","icon":"🛒","color":"#F59E0B","limit_amount":3000},
    {"category":"Transport","icon":"🚗","color":"#8B5CF6","limit_amount":2000},
    {"category":"Entertainment","icon":"🎬","color":"#EC4899","limit_amount":1500},
    {"category":"Utilities","icon":"📡","color":"#6366F1","limit_amount":2000}
  ]'::jsonb
),
(
  'daily_wage_gig_worker',
  'Daily wage / gig worker',
  '[
    "Hi! I am FinSight. On a good week, roughly how much do you earn?",
    "How much does your income vary week to week — a little, or a lot?",
    "What''s your biggest regular expense each month?",
    "Do you have any savings set aside for slow weeks or emergencies?",
    "Any loans or informal debts you are repaying right now?"
  ]'::jsonb,
  'User has irregular daily or gig income. Emphasize cash runway, income variability, and emergency buffer. Avoid assuming a fixed payday.',
  '[
    {"category":"Food & Dining","icon":"🍔","color":"#F59E0B","limit_amount":6000},
    {"category":"Transport","icon":"🚗","color":"#8B5CF6","limit_amount":3500},
    {"category":"Housing","icon":"🏠","color":"#0EA5E9","limit_amount":8000},
    {"category":"Utilities","icon":"⚡","color":"#6366F1","limit_amount":2500},
    {"category":"Health","icon":"💊","color":"#EF4444","limit_amount":2000}
  ]'::jsonb
),
(
  'business_owner',
  'Business owner',
  '[
    "Hi! I am FinSight. Let''s map your business finances. What''s your typical monthly revenue?",
    "What are your main operating costs — rent, staff, inventory, or utilities?",
    "Do you keep personal and business finances separate?",
    "What''s the biggest financial challenge in your business right now?",
    "Do you have any business loans or credit lines outstanding?"
  ]'::jsonb,
  'User runs a small business. Separate revenue vs costs. Use practical business vocabulary but stay accessible.',
  '[
    {"category":"Business Costs","icon":"🏢","color":"#6366F1","limit_amount":40000},
    {"category":"Business Revenue","icon":"💼","color":"#1A8A4A","limit_amount":80000},
    {"category":"Housing","icon":"🏠","color":"#0EA5E9","limit_amount":15000},
    {"category":"Food & Dining","icon":"🍔","color":"#F59E0B","limit_amount":8000},
    {"category":"Transport","icon":"🚗","color":"#8B5CF6","limit_amount":5000}
  ]'::jsonb
)
on conflict (persona) do update set
  display_label = excluded.display_label,
  onboarding_questions = excluded.onboarding_questions,
  system_prompt_fragment = excluded.system_prompt_fragment,
  default_budget_template = excluded.default_budget_template;
