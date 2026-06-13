# FinSight AI — Full Implementation Guide

> **How to use this doc:** Pull latest from `develop`, open this file, and tell your AI agent:
> **"I am Person [1/2/3/4] on the FinSight team. Follow IMPLEMENTATION.md and implement my section only. Do not run git commands."**
>
> Repo: [FinSightAI](https://github.com/ragavhariharan/FinSightAI) · Branch: `develop`

---

## 1. What FinSight Is

FinSight AI is a persona-aware personal finance app for India. Users sign up, answer MCQs to get a financial persona (Student, Salaried employee, Daily wage / gig worker, Business owner), then have an AI conversation that builds their financial profile. The dashboard shows briefing, health score, Spending DNA, forecast, leak detector, budgets, and reports. A persistent AI Copilot sidebar lets users ask questions and manage finances via chat (e.g. "I spent ₹500 on groceries").

---

## 2. Current State (What Exists Today)

### Done — frontend UI only (no real backend)

| Area | Status | Location |
|------|--------|----------|
| Landing page | ✅ Static UI | `src/pages/Landing.jsx` |
| Auth page | ✅ UI only — submit does nothing real | `src/pages/Auth.jsx` |
| Onboarding MCQ (5 questions) | ✅ UI only | `src/pages/OnboardingMCQ.jsx` |
| Onboarding chat | ✅ Fake scripted replies | `src/pages/OnboardingChat.jsx` |
| App shell + sidebar nav | ✅ Works | `src/pages/AppShell.jsx` |
| Dashboard | ✅ Hardcoded numbers | `src/views/Dashboard.jsx` |
| Transactions | ✅ 18 mock rows | `src/views/Transactions.jsx` |
| Reports | ✅ Hardcoded donut | `src/views/Reports.jsx` |
| Budget | ✅ Mock budgets in state | `src/views/Budget.jsx` |
| AI Copilot sidebar | ✅ Keyword-matching fake AI | `src/components/AISidebar.jsx` |
| Recurring / Goals | ⚠️ Placeholder "coming soon" | `src/views/OtherView.jsx` |
| Routing | ✅ Client-side `page` state | `src/context.jsx` + `src/App.jsx` |

### Not done

- No Supabase connection
- No real auth (email or Google)
- No database
- No OpenRouter / AI API calls
- No deployment
- No env vars
- No CSV upload screen
- `getAIReply()` in `context.jsx` is fake keyword matching
- All data lives in `src/context.jsx` as constants (`TRANSACTIONS`, `INITIAL_BUDGETS`, etc.)

### Tech stack today

- React 18 + Vite 6
- No Tailwind (inline styles)
- No `@supabase/supabase-js` yet

---

## 3. Target Architecture

```
React App (Vite)
    │
    ├── Supabase JS Client ──► Auth (email + Google)
    │                       ──► Postgres (RLS) — profiles, transactions, budgets, etc.
    │                       ──► Storage — CSV uploads
    │
    └── Supabase Edge Functions ──► OpenRouter (openai/gpt-oss-120b:free)
              │
              ├── ai-onboarding   (profile builder chat)
              ├── ai-copilot      (sidebar Q&A + CRUD intent)
              └── execute-ai-actions (validate + write to DB)
                        │
                        └── triggers recompute_dashboard_snapshot()
```

**Security rule:** `OPENROUTER_API_KEY` lives **only** in Supabase Edge Function secrets. Never in React or `.env` committed to git.

---

## 4. Environment Variables

### Frontend (`.env.local` — do NOT commit)

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Supabase Edge Function secrets (Supabase Dashboard → Edge Functions → Secrets)

```
OPENROUTER_API_KEY=your_openrouter_key
```

### AI model (use everywhere)

```
openai/gpt-oss-120b:free
```

OpenRouter API: `POST https://openrouter.ai/api/v1/chat/completions`

---

## 5. Database Schema (Supabase Postgres)

Person 1 creates all of this. **Do not rename tables** — everyone depends on these names.

### Enums

```sql
persona_type: student | salaried_employee | daily_wage_gig_worker | business_owner
onboarding_status: not_started | mcq_in_progress | mcq_complete | data_choice_pending | upload_complete | chat_in_progress | chat_complete | complete
profile_field_source: conversation | upload | manual | mcq | system_default
spending_type: routine | flexible | impulse
```

### Persona display labels (frontend ↔ DB)

| DB value | UI label (matches MCQ Q2) |
|----------|---------------------------|
| `student` | Student |
| `salaried_employee` | Salaried employee |
| `daily_wage_gig_worker` | Daily wage / gig worker |
| `business_owner` | Business owner |

### Tables

#### `profiles` (1 row per auth user — id = auth.users.id)

| Column | Notes |
|--------|-------|
| `full_name` | From signup |
| `email` | From auth |
| `persona` | Set after MCQ question 2 |
| `onboarding_status` | Drives routing |
| `onboarding_data_path` | `skip` \| `upload` \| `demo` |
| `mcq_answers` | jsonb `{ "0": 2, "1": 1, ... }` |
| `is_demo` | boolean |
| `avatar_initials` | e.g. `AK` |

#### `profile_fields` (flexible financial profile from AI conversation)

| Column | Notes |
|--------|-------|
| `field_key` | e.g. `monthly_income`, `income_frequency`, `savings_goal_description` |
| `value_text`, `value_numeric`, `value_json` | Extracted values |
| `source` | `conversation` / `upload` / etc. |
| Unique: `(user_id, field_key)` |

#### `transactions`

| Column | Notes |
|--------|-------|
| `txn_date` | date (ISO) |
| `name` | merchant label — **not** `description` |
| `category` | text |
| `emoji` | text |
| `account` | text |
| `amount` | **negative = expense, positive = income** |
| `spending_type` | routine / flexible / impulse |
| `source` | `manual` \| `chat` \| `upload` \| `seed` |

#### `budgets`

| Column | Notes |
|--------|-------|
| `category`, `icon`, `color` | |
| `limit_amount` | monthly limit |
| `month` | first of month e.g. `2025-06-01` |
| **`spent` is NOT stored** — computed from transactions |

#### `dashboard_snapshots` (1 row per user — dashboard reads this)

| Column | Notes |
|--------|-------|
| `snapshot` | jsonb — briefing, health_score, spending_dna, forecast, leaks, donut_segments, etc. |
| `period_month` | current month |
| Recomputed by `recompute_dashboard_snapshot(user_id)` on any data change |

#### `onboarding_chat_messages`

Messages during onboarding only. Columns: `role`, `content`, `question_index`, `extracted_fields`.

#### `copilot_messages`

Persistent AI sidebar history. Columns: `role`, `content`, `actions_executed`.

#### `pending_ai_actions`

For update/delete confirmation before executing destructive CRUD.

#### `persona_config` (seed data — 4 rows, read-only for clients)

Per persona: `onboarding_questions`, `system_prompt_fragment`, `default_budget_template`, `dashboard_framing`.

#### `statement_uploads` (CSV path)

Storage path, parse status, rows imported.

### RLS

Every user-owned table: `auth.uid() = user_id` for SELECT/INSERT/UPDATE/DELETE.

### Signup trigger

On `auth.users` insert → auto-create `profiles` row.

### Recompute trigger

On `transactions` INSERT/UPDATE/DELETE → call `recompute_dashboard_snapshot(user_id)`.

---

## 6. Edge Functions

### `ai-onboarding`

- Input: `{ message, question_index }`
- Loads persona config + prior messages + existing profile_fields
- Calls OpenRouter `openai/gpt-oss-120b:free` with structured JSON output
- Extracts fields → upsert `profile_fields`
- Saves messages to `onboarding_chat_messages`
- Max 6–8 questions per persona
- Returns: `{ reply, question_index, is_complete, extracted_fields }`
- On complete: set `onboarding_status = chat_complete`, seed default budgets, call recompute

### `ai-copilot`

- Input: `{ message, mode: "default" | "what_if" }`
- Loads profile, snapshot, recent transactions, budgets, profile_fields
- Calls OpenRouter with full financial context
- Returns JSON: `{ reply, actions: [...] }`
- **Create** actions → execute immediately via `execute-ai-actions`
- **Update/delete** → insert `pending_ai_actions`, ask user to confirm in next message
- **what_if** → run forecast math, no DB writes
- Saves to `copilot_messages`

### `execute-ai-actions`

Action types:

| Type | DB effect | Confirm? |
|------|-----------|----------|
| `create_transaction` | insert `transactions` | No |
| `update_transaction` | update `transactions` | Yes |
| `delete_transaction` | delete `transactions` | Yes |
| `upsert_profile_field` | upsert `profile_fields` | No |
| `upsert_budget` | upsert `budgets` | No |

After writes → `recompute_dashboard_snapshot(user_id)`.

### AI response JSON format (required from model)

```json
{
  "reply": "Got it — logged ₹500 groceries expense.",
  "actions": [
    {
      "type": "create_transaction",
      "requires_confirmation": false,
      "data": {
        "name": "Groceries",
        "amount": -500,
        "category": "Groceries",
        "txn_date": "2025-06-13"
      }
    }
  ]
}
```

---

## 7. User Flow (Full Site)

```
Landing
  → Sign up / Login (email or Google)
  → Onboarding MCQ (5 questions) → persona assigned
  → Data choice: Upload CSV OR Skip
  → AI onboarding chat (6–8 persona-specific questions)
  → Dashboard (main app)
      ├── Dashboard view
      ├── Transactions (+ Add transaction)
      ├── Reports
      ├── Budget (+ Add budget)
      ├── Recurring (basic or polished placeholder)
      ├── Goals (basic or polished placeholder)
      └── AI Copilot sidebar (always available)
```

### Routing logic (replace fake `page` state)

| Condition | Route / page |
|-----------|----------------|
| No session | `landing` |
| Session + `onboarding_status` not `complete` | MCQ → data choice → chat |
| Session + `onboarding_status = complete` | `app` |
| Demo button | Login as demo user with pre-seeded data |

---

## 8. Full Feature Checklist

Use this to track what's done. Check off as you ship.

### Auth & profiles
- [ ] Supabase project created
- [ ] Email/password signup + login
- [ ] Google OAuth (Google Cloud Console + Supabase Auth)
- [ ] Auto-create `profiles` on signup
- [ ] Session persistence on refresh
- [ ] Sign out
- [ ] Demo user account with seed data

### Onboarding
- [ ] MCQ saves to `profiles.mcq_answers`
- [ ] Persona set from MCQ Q2
- [ ] Data choice screen (upload vs skip)
- [ ] CSV upload → parse → bulk insert transactions
- [ ] AI onboarding chat via `ai-onboarding` edge function
- [ ] Profile fields extracted and saved
- [ ] Default budgets seeded from `persona_config`
- [ ] `onboarding_status = complete` → route to app

### Dashboard
- [ ] All cards read from `dashboard_snapshots.snapshot`
- [ ] Briefing card (persona-aware text)
- [ ] Financial health score gauge
- [ ] Monthly spend + savings rate
- [ ] Spending DNA bars
- [ ] Savings forecast chart
- [ ] Leak detector
- [ ] Real user name in greeting

### Transactions
- [ ] List from DB grouped by date
- [ ] Search works
- [ ] Summary strip (count, income, spend, largest)
- [ ] Add transaction form/modal
- [ ] Dashboard updates after add

### Budget
- [ ] List from DB with computed `spent`
- [ ] Progress bars with color thresholds
- [ ] Add budget form

### Reports
- [ ] Donut chart from snapshot or aggregated data
- [ ] Stats row (income, expenses, net savings, rate)
- [ ] Income tab (stretch)

### AI Copilot
- [ ] Real OpenRouter responses
- [ ] Q&A using live data ("what can I cut?")
- [ ] Create transaction via chat
- [ ] Dashboard refreshes live after chat CRUD
- [ ] What-if scenarios ("can I afford ₹15,000?")
- [ ] Update/delete with confirmation (stretch)

### Recurring & Goals
- [ ] Minimum: keep placeholder with copilot redirect
- [ ] Stretch: simple list + add via chat or form

### Deploy
- [ ] Frontend on Vercel or Netlify
- [ ] Env vars set in hosting dashboard
- [ ] Google OAuth redirect URLs include production domain
- [ ] End-to-end test on production URL

---

## 9. Target Repo Structure (after implementation)

```
arcnight/
├── IMPLEMENTATION.md          ← this file
├── .env.local                 ← gitignored
├── .env.example               ← template only
├── package.json
├── supabase/
│   ├── migrations/
│   │   ├── 001_enums_and_profiles.sql
│   │   ├── 002_core_tables.sql
│   │   ├── 003_views_rls_triggers.sql
│   │   └── 004_seed_persona_config.sql
│   └── functions/
│       ├── ai-onboarding/index.ts
│       ├── ai-copilot/index.ts
│       ├── execute-ai-actions/index.ts
│       └── _shared/
│           ├── openrouter.ts
│           ├── prompts.ts
│           └── actions.ts
└── src/
    ├── lib/
    │   ├── supabase.js
    │   └── api/
    │       ├── auth.js
    │       ├── dashboard.js
    │       ├── transactions.js
    │       ├── budgets.js
    │       ├── onboarding.js
    │       └── copilot.js
    ├── context.jsx            ← refactored: real data, not mocks
    ├── App.jsx
    ├── pages/
    │   ├── Landing.jsx
    │   ├── Auth.jsx
    │   ├── OnboardingMCQ.jsx
    │   ├── OnboardingDataChoice.jsx   ← NEW
    │   ├── OnboardingChat.jsx
    │   └── AppShell.jsx
    ├── views/
    │   ├── Dashboard.jsx
    │   ├── Transactions.jsx
    │   ├── Reports.jsx
    │   ├── Budget.jsx
    │   └── OtherView.jsx
    └── components/
        └── AISidebar.jsx
```

---

## 10. Team Roles

### Person 1 — Supabase, Auth & Database

**You are the foundation. Merge your SQL migrations first. Everyone waits on you for hour 1.**

#### Responsibilities

1. Create Supabase project
2. Run all migrations (schema, RLS, triggers, seed `persona_config`)
3. Enable Email auth + Google OAuth
4. Set up Storage bucket `statement-uploads` with RLS
5. Write `recompute_dashboard_snapshot()` Postgres function
6. Provide `.env.example` with Supabase URL + anon key
7. Set `OPENROUTER_API_KEY` in Edge Function secrets

#### Files you create/edit

```
supabase/migrations/*
.env.example
src/lib/supabase.js          (create client — others will use it)
src/pages/Auth.jsx           (wire real signup/login/google)
```

#### Tasks checklist

- [ ] All tables + enums created
- [ ] RLS policies on all user tables
- [ ] Signup trigger creates profiles row
- [ ] Recompute function + trigger on transactions
- [ ] persona_config seeded (4 personas matching PERSONA_SCRIPTS in context.jsx)
- [ ] Google OAuth working locally
- [ ] Storage bucket for CSV uploads

#### Prompts to give your AI

- "Create supabase/migrations/001 through 004 for FinSight schema per IMPLEMENTATION.md section 5"
- "Write recompute_dashboard_snapshot Postgres function that computes health_score, spending_dna, forecast, leaks, donut_segments from transactions and profile_fields"
- "Wire Auth.jsx to supabase.auth.signUp, signInWithPassword, signInWithOAuth({ provider: 'google' })"
- "Create src/lib/supabase.js with createClient using VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY"

#### Do NOT

- Put OpenRouter key in frontend
- Create a separate `users` table (use auth.users + profiles)
- Rename transaction column to `description` (frontend uses `name`)

---

### Person 2 — Data Layer & All Dashboard Views

**You kill every mock constant. All numbers come from Supabase.**

#### Responsibilities

1. Replace `TRANSACTIONS`, `INITIAL_BUDGETS`, `buildForecast`, `buildDonut`, `buildGauge` mocks with DB reads
2. Wire Dashboard, Transactions, Budget, Reports to real data
3. Build Add Transaction + Add Budget UI
4. CSV parse + bulk insert (with Person 4's upload screen)
5. Create API helpers in `src/lib/api/`
6. Optional: Supabase Realtime subscription on `dashboard_snapshots` for live refresh

#### Files you edit

```
src/context.jsx              (remove mock data, add fetch logic)
src/views/Dashboard.jsx
src/views/Transactions.jsx
src/views/Budget.jsx
src/views/Reports.jsx
src/lib/api/transactions.js
src/lib/api/budgets.js
src/lib/api/dashboard.js
```

#### Tasks checklist

- [ ] Fetch transactions on app load
- [ ] getTxGroups() uses DB data not TRANSACTIONS constant
- [ ] Dashboard reads dashboard_snapshots.snapshot
- [ ] Add transaction modal inserts to DB
- [ ] Budget page shows spent computed from transactions
- [ ] Add budget inserts to DB
- [ ] Reports donut from snapshot JSON
- [ ] CSV parser inserts rows with source='upload'
- [ ] Refetch snapshot after any write

#### Prompts to give your AI

- "Replace TRANSACTIONS constant in context.jsx with supabase.from('transactions').select() and store in state"
- "Wire Dashboard.jsx to read all metrics from dashboard_snapshots.snapshot JSON per IMPLEMENTATION.md"
- "Build Add Transaction modal in Transactions view — fields: name, amount, category, txn_date, account, emoji"
- "Wire Budget.jsx to fetch budgets and compute spent per category from transactions for current month"
- "Write CSV parser using PapaParse that maps columns to transactions and bulk inserts"

#### Do NOT

- Call OpenRouter from frontend (Person 3's job)
- Change database schema without syncing Person 1

---

### Person 3 — AI (OpenRouter gpt-oss-120b)

**You make the product intelligent. All LLM calls go through Edge Functions.**

#### Responsibilities

1. Build `ai-onboarding`, `ai-copilot`, `execute-ai-actions` edge functions
2. Write system prompts per persona (use `persona_config` table)
3. Parse structured JSON actions from model responses
4. Wire `sendChatMessage` → `ai-onboarding`
5. Wire `sendAIMessage` → `ai-copilot`
6. Remove fake `getAIReply()` and static script replies
7. Implement what-if mode
8. Implement confirmation flow for update/delete

#### Files you create/edit

```
supabase/functions/ai-onboarding/index.ts
supabase/functions/ai-copilot/index.ts
supabase/functions/execute-ai-actions/index.ts
supabase/functions/_shared/*
src/lib/api/onboarding.js
src/lib/api/copilot.js
src/context.jsx              (sendChatMessage, sendAIMessage only)
```

#### Tasks checklist

- [ ] ai-onboarding deployed and returns real replies
- [ ] Profile fields extracted and saved to profile_fields
- [ ] ai-copilot deployed with full user context in prompt
- [ ] create_transaction via chat works end-to-end
- [ ] Dashboard refreshes after copilot creates transaction
- [ ] what_if mode answers "can I afford X?"
- [ ] update/delete requires confirmation via pending_ai_actions
- [ ] Model: openai/gpt-oss-120b:free everywhere

#### Prompts to give your AI

- "Create Supabase Edge Function ai-copilot using openai/gpt-oss-120b:free. Load user transactions, snapshot, profile_fields. Return JSON with reply and actions array per IMPLEMENTATION.md section 6"
- "Create execute-ai-actions that validates JWT, runs create_transaction, upsert_profile_field, upsert_budget, and calls recompute_dashboard_snapshot"
- "Replace getAIReply in context.jsx — sendAIMessage should call ai-copilot edge function and refetch dashboard snapshot after actions"
- "Replace onboarding sendChatMessage to call ai-onboarding instead of PERSONA_SCRIPTS setTimeout fake replies"
- "Write persona-specific system prompts for student, salaried_employee, daily_wage_gig_worker, business_owner"

#### Do NOT

- Expose OPENROUTER_API_KEY to React
- Let model execute delete without confirmation

---

### Person 4 — App Flow, Integration & Deploy

**You own the user journey from landing to deployed URL. You glue everyone's work together.**

#### Responsibilities

1. Refactor routing: session + `onboarding_status` drives pages (not fake `goTo`)
2. Build `OnboardingDataChoice.jsx` (upload CSV vs skip)
3. Wire MCQ → save answers → set persona
4. Demo user: seed 18 transactions from existing mock data in context.jsx
5. AppShell: real name, initials, persona, sign out
6. Loading states, error toasts, empty states
7. Deploy frontend to Vercel/Netlify
8. Production Google OAuth redirect URLs
9. Demo script rehearsal

#### Files you create/edit

```
src/pages/OnboardingDataChoice.jsx   ← NEW
src/pages/OnboardingMCQ.jsx
src/pages/OnboardingChat.jsx
src/pages/AppShell.jsx
src/pages/Landing.jsx
src/context.jsx                        (routing logic, tryDemo, session)
src/App.jsx
.env.example                           (with Person 1)
```

#### Tasks checklist

- [ ] On app load: check supabase.auth.getSession()
- [ ] Route logged-out users to landing
- [ ] Route by profiles.onboarding_status through MCQ → data choice → chat → app
- [ ] MCQ completion saves mcq_answers + persona + status
- [ ] Data choice screen works (upload hands off to Person 2 parser, skip goes to chat)
- [ ] Demo user logs in with pre-seeded data
- [ ] AppShell shows profiles.full_name and persona
- [ ] Sign out clears session → landing
- [ ] Deployed to production URL
- [ ] Google OAuth works on production domain

#### Prompts to give your AI

- "Refactor context.jsx routing: use supabase session and profiles.onboarding_status instead of manual page state"
- "Create OnboardingDataChoice.jsx — two buttons: Upload bank statement (CSV) or Skip and continue with chat"
- "Wire OnboardingMCQ to save mcq_answers to profiles and map MCQ Q2 answer to persona_type enum"
- "Implement tryDemo as login to demo@finsight.app (or create demo user) with is_demo=true and seed transactions"
- "Add sign out button to AppShell and loading spinner during auth check"
- "Deploy Vite app to Vercel with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY env vars"

#### Do NOT

- Change database schema (Person 1)
- Rewrite dashboard components (Person 2)

---

## 11. Dependencies Between People

```
Hour 0–1:  Person 1 must finish schema + auth first
Hour 1–3:  Person 2 + Person 4 can work in parallel (Person 2 needs supabase.js from Person 1)
Hour 2–5:  Person 3 needs tables + recompute function from Person 1, then wires AI
Hour 5–7:  Person 4 integrates all flows + deploy
Hour 7–10: Everyone fixes integration bugs together
```

**Git rule:** Work on `develop`. Pull before you start. Person 1 pushes migrations first. **Do not let AI agents run git commit/push** — humans commit with their own accounts.

---

## 12. Standard Categories (use consistently)

```
Paychecks, Housing, Food & Dining, Groceries, Shopping, Transport,
Utilities, Insurance, Health, Fitness, Entertainment,
Business Revenue, Business Costs, Other
```

Budget groups in frontend mock (map as needed):

```
Housing, Food & Dining, Shopping, Utilities & Insurance, Transport, Health & Fitness
```

---

## 13. Demo User Seed Data

Use the 18 transactions already in `src/context.jsx` `TRANSACTIONS` array for the demo account. Insert with `source: 'seed'`.

Demo flow: Auth page → "Continue as Demo User" → skip onboarding OR use pre-completed demo profile → land on dashboard with full data.

---

## 14. Deployment Steps

### Supabase
1. Project already hosted by Supabase
2. Run migrations in SQL editor or `supabase db push`
3. Deploy edge functions: `supabase functions deploy ai-onboarding` (etc.)
4. Set secrets: `supabase secrets set OPENROUTER_API_KEY=...`

### Frontend (Vercel recommended)
1. Connect GitHub repo, branch `develop` or `main`
2. Build command: `npm run build`
3. Output directory: `dist`
4. Environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
5. Add production URL to Supabase Auth redirect URLs
6. Add production URL to Google OAuth authorized redirect URIs

### Local dev
```bash
npm install
npm install @supabase/supabase-js
# optional: npm install papaparse
cp .env.example .env.local
# fill in Supabase keys
npm run dev
```

---

## 15. 60-Second Demo Script (for judges)

1. Open deployed URL → Landing page
2. Click **Get started** → Sign in with Google
3. Complete 5 MCQs → persona badge shows (e.g. Salaried employee)
4. Skip CSV upload → AI onboarding asks about income
5. Answer 2–3 questions → Dashboard loads with briefing + health score
6. Open AI Copilot → type: **"I just got paid ₹3,000 today and spent ₹400 on groceries"**
7. AI confirms → transaction appears in Transactions tab → dashboard forecast updates live

---

## 16. Hour-by-Hour Timeline

| Hour | Target |
|------|--------|
| 0–1 | Person 1: schema + auth live. Others: pull repo, read this doc |
| 1–2 | Sign up works. profiles row created |
| 2–3 | Transactions in DB. Dashboard shows real numbers (Person 2) |
| 3–4 | MCQ + routing wired (Person 4) |
| 4–5 | AI onboarding chat works (Person 3) |
| 5–6 | AI copilot creates transactions via chat (Person 3) |
| 6–7 | Budget + Reports wired (Person 2) |
| 7–8 | Full flow end-to-end locally |
| 8–9 | Deploy to production |
| 9–10 | Rehearse demo, fix blockers only — no new features |

---

## 17. What to Skip If Running Out of Time

Cut in this order (last = cut first):

1. Recurring / Goals full implementation (keep placeholder)
2. CSV upload path
3. Update/delete via chat (create via chat is enough for demo)
4. Reports Income tab
5. What-if scenarios (nice pitch mention)

**Never cut:** Auth, onboarding MCQ + chat, dashboard from DB, copilot create transaction live.

---

## 18. Quick Reference — Frontend → Backend Mapping

| Frontend | Backend |
|----------|---------|
| `authName` | `profiles.full_name` |
| `persona` | `profiles.persona` (via label map) |
| `mcqAnswers` | `profiles.mcq_answers` |
| `TRANSACTIONS[].name` | `transactions.name` |
| `TRANSACTIONS[].amount` | `transactions.amount` |
| `budgets[].cat` | `budgets.category` |
| `budgets[].limit` | `budgets.limit_amount` |
| `budgets[].spent` | computed, not stored |
| `aiMessages` | `copilot_messages` |
| `chatMessages` (onboarding) | `onboarding_chat_messages` |
| Dashboard hardcoded stats | `dashboard_snapshots.snapshot` |
| `getAIReply()` | `ai-copilot` edge function |
| `PERSONA_SCRIPTS` fake replies | `ai-onboarding` edge function |

---

*Last updated: hackathon build · Model: `openai/gpt-oss-120b:free` · Stack: React + Vite + Supabase + OpenRouter*
