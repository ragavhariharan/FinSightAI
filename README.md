<div align="center">

<img src="./docs/assets/banner.svg" alt="FinSight — Persona-aware personal finance for India" width="100%" />

<br /><br />

<img src="./docs/assets/logo-mark.svg" alt="" width="40" height="40" />
&nbsp;&nbsp;
<img src="./docs/assets/logo-full.svg" alt="FinSight" height="48" />

<br /><br />

**Track spending. Hit savings goals. Talk to your money in plain language.**

<br />

Persona-aware personal finance built for India — real-time dashboards, category budgets, investments, and **Kash**, your AI copilot.

<br /><br />

[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-RLS-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![INR](https://img.shields.io/badge/Currency-INR_%E2%82%B9-F05A22?style=for-the-badge)](.)

<br /><br />

[Features](#features) · [Screenshot](#screenshot) · [Architecture](#architecture) · [Getting started](#getting-started)

</div>

---

## Screenshot

<p align="center">
  <img src="./ss.png" alt="FinSight dashboard — health score, monthly spend, savings forecast, spending breakdown, and recent activity" width="92%" />
</p>

<p align="center">
  <sub>Dashboard with financial health score, monthly metrics, category breakdown, savings forecast, and recent transactions.</sub>
</p>

---

## Overview

Most finance apps treat every user the same. FinSight starts with **who you are** — student, salaried professional, or business owner — and shapes onboarding, default budgets, and dashboard insights around that profile.

Every transaction flows through a PostgreSQL-backed pipeline: budgets update automatically, dashboard snapshots recompute server-side, and Kash always sees your latest numbers.

<table>
<tr>
<td width="33%" align="center">
<img src="./docs/assets/icon-dashboard.svg" width="36" alt="" /><br /><br />
<strong>Live dashboard</strong><br />
<sub>Health score, forecasts, leak detection</sub>
</td>
<td width="33%" align="center">
<img src="./docs/assets/icon-kash.svg" width="36" alt="" /><br /><br />
<strong>Kash AI</strong><br />
<sub>Chat to log spends and ask questions</sub>
</td>
<td width="33%" align="center">
<img src="./docs/assets/icon-invest.svg" width="36" alt="" /><br /><br />
<strong>India-native data</strong><br />
<sub>INR, AMFI NAV, NSE/BSE quotes, Indian news</sub>
</td>
</tr>
</table>

**Try it instantly:** open the app and click **Try live demo** — fully interactive, no sign-up required.

---

## Features

<table>
<tr>
<td valign="top" width="50%">

### Dashboard

<img src="./docs/assets/icon-dashboard.svg" width="22" align="left" alt="" />

- **Financial health score** — 0–100 gauge from savings rate and budget adherence
- **Monthly snapshot** — spend, net savings, savings rate vs income
- **Personalized briefing** — contextual summary from your profile and month
- **Spending breakdown** — top categories with progress bars
- **Savings forecast** — cumulative chart with run-rate projection
- **Leak detector** — categories up more than 25% vs last month
- **Recent activity** — latest transactions with quick navigation

<br />

### Transactions

- Manual entry via floating action button
- **Chat logging through Kash** — *"I spent ₹500 on groceries"*
- Search, filter, sort by date or amount
- Automatic recurring expense detection
- Delete with live dashboard refresh

<br />

### Budgets

- Per-category monthly limits with progress bars
- Overall usage with warnings at 75% and 90%
- **Persona-seeded defaults** on onboarding complete
- Add custom categories for the current month

<br />

### Reports

- Income, expenses, savings rate, daily average, recurring total
- Donut chart for category distribution
- Top five merchants by spend
- Spending alerts from leak detector

</td>
<td valign="top" width="50%">

### Accounts and net worth

- Multiple bank accounts with default selector
- Balances update from logged transactions
- **Net worth** across banks, stocks, mutual funds, assets, liabilities

<br />

### Recurring expenses

- Preset OTT and subscription catalog
- Custom recurring items
- Pattern detection from transaction history

<br />

### Investments

<img src="./docs/assets/icon-invest.svg" width="22" align="left" alt="" />

- **Stocks** — NSE/BSE holdings, live Yahoo Finance quotes
- **Mutual funds** — AMFI search, NAV, gain/loss, XIRR, benchmark compare

<br />

### Savings goals and challenges

- Timeline-based savings targets with progress tracking
- Gamified challenges with XP and levels
- Presets: no-spend weekend, cut food delivery, extra savings

<br />

### News feed

- Indian financial news — Mint, ET, Moneycontrol, Google News
- Personalized ranking from interests, spending, holdings
- Server-side cache with manual refresh

<br />

### Kash — AI copilot

<img src="./docs/assets/icon-kash.svg" width="22" align="left" alt="" />

- Resizable sidebar on every screen
- OpenRouter via Supabase Edge Function
- Context-aware replies from snapshot + transactions
- Creates transactions from natural language
- Local fallback for demo mode

</td>
</tr>
</table>

### Onboarding, auth, and settings

| Area | What ships |
|------|------------|
| **Onboarding** | Multi-step questionnaire with persona-specific questions (Student, Salaried, Business owner); seeds budgets on completion |
| **Authentication** | Email/password and Google OAuth; Row Level Security on all user data |
| **Settings** | Light/dark/system theme; toggle modules; resizable sidebar and Kash panel |

---

## Architecture

<p align="center">
  <img src="./docs/assets/architecture.svg" alt="FinSight system architecture — React frontend, Supabase backend, edge functions, PostgreSQL snapshot pipeline" width="100%" />
</p>

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite 6, CSS custom properties (light/dark themes) |
| Backend | Supabase Auth, PostgreSQL, Row Level Security, Edge Functions |
| AI | OpenRouter via `ai-copilot` and `ai-onboarding` |
| Market data | Yahoo Finance (equities), AMFI India NAV file (mutual funds) |
| News | LiveMint, Economic Times, Moneycontrol, Google News RSS |

Dashboard metrics are computed in PostgreSQL (`recompute_dashboard_snapshot`), not in the browser. Each write triggers a fresh snapshot: income, spend, category breakdown, month-over-month leaks, and forecast points stored in `dashboard_snapshots`.

**Edge functions:** `ai-copilot` · `ai-onboarding` · `market-data` · `news-feed`

---

## Getting started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project

### 1. Install

```bash
npm install
```

### 2. Environment

```bash
cp .env.example .env.local
```

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from your Supabase project settings.

### 3. Database

Apply `supabase/migrations/001` through `008` in order via the Supabase SQL Editor or CLI.

### 4. Edge functions

Deploy `supabase/functions/` and set secrets:

| Secret | Required for |
|--------|----------------|
| `OPENROUTER_API_KEY` | Kash copilot and AI onboarding |
| `SUPABASE_SERVICE_ROLE_KEY` | News cache writes (recommended) |

### 5. Run

```bash
npm run dev
```

Use **Try live demo** to explore without Supabase configuration.

```bash
npm run build    # production bundle
npm run preview  # preview build locally
```

---

## Project structure

```
src/
  pages/          Landing, Auth, Onboarding, AppShell
  views/          Dashboard, Transactions, Budget, Reports, Accounts, …
  components/     Kash sidebar, transaction modal, shared UI
  lib/            API clients, formatting, personalization logic

supabase/
  migrations/     Schema, RLS, snapshot recompute, persona seeds
  functions/      AI copilot, onboarding, market data, news feed

docs/assets/      README branding — logo, banner, architecture SVG
```

---

## Data and privacy

<p align="left">
<img src="./docs/assets/icon-shield.svg" width="28" align="left" alt="" />
</p>

- Row Level Security on all user tables (`auth.uid() = user_id`)
- OpenRouter keys live only in Edge Function secrets, never in the frontend
- Preferences in `localStorage`; Kash session in `sessionStorage`

---

<div align="center">

<img src="./docs/assets/logo-mark.svg" alt="" width="28" height="28" />

<br /><br />

<sub>FinSight — built for how Indians earn, spend, and save.</sub>

<br /><br />

Private project — all rights reserved.

</div>
