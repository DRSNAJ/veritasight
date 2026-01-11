# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: VeritaSight

**Personal investment dashboard for tracking Sri Lankan equities.**

Single-user application. V1 intentionally narrow: no predictions, no automation, no analysis theater. Goal is to see current holdings, key metrics, and index-relative performance at a glance.

## Product Constraints (V1)

- **Single user only** - no multi-user features, no role systems
- **Desktop-first** - mobile optimization explicitly out of scope
- **No predictions or recommendations** - this is a data surface, not an advisor
- **No news ingestion** - relies solely on market data
- **Speed is critical** - portfolio state must be understandable in <60 seconds

## Data Architecture

### Data Sources (Read-Only)

Two existing Postgres tables with hourly ingestion (do NOT modify these):

**`ticker_raw_data`** - Individual stock data
- Key fields: `symbol`, `name`, `lasttradedprice`, `previousclose`, `change`, `changepercentage`
- Period highs/lows: `wtdhiprice`, `mtdhiprice`, `ytdhiprice`, etc.
- Trading volume: `tdysharevolume`, `wtdturnover`, `marketcap`
- Note: Has `sharesHeld` field but this is in the raw table (needs clarification on write strategy)

**`index_raw_data`** - Index benchmarks (ASPI, S&P SL20)
- Key fields: `ticker`, `value`, `change`, `percentage`, `highvalue`, `lowvalue`
- Timestamp tracking: `timestamp`, `timeCreated`

### User Data (Needs Implementation)

Create separate tables for user-entered data:

1. **Portfolio holdings** - shares held per stock (writable)
2. **Manual assets** - fixed deposits, bonds, cash, other (writable)
3. **User notes** - lightweight text annotations (optional)

**Critical**: Keep user data isolated from raw ingestion tables.

## Core Features (V1 Scope)

### Dashboard Requirements

**Stock Holdings Table**
- Display: symbol, name, shares held (editable), last price, holding value (derived)
- Performance: day/WTD/MTD/YTD changes
- Relative performance vs ASPI and S&P SL20
- Sort by holding value (default) or % change

**Non-Equity Holdings**
- Support: fixed deposits, bonds, cash, "other"
- Manual value entry (no yield calculations in V1)
- Included in total portfolio value and allocation charts
- Excluded from price-performance graphs

**Index Overview**
- ASPI and S&P SL20 summary cards (value, change, %)
- Visually muted compared to portfolio values

**Graph Views**
1. **Per-share price performance** - line chart with toggle visibility, optional index overlays, normalization toggle
2. **Portfolio vs index (aggregate)** - normalized comparison rebased to same start date
3. **Portfolio composition** - donut chart by holding or asset class

### UX Design Principles (Linear-Inspired)

- **Calm, fast, precise, effortless**
- Clarity over decoration, speed over flourish
- Neutral color palette (grays, off-whites), minimal accent
- Flat surfaces, minimal borders, soft shadows for hierarchy only
- Desktop-first, keyboard-friendly
- Instant feedback on inline edits
- Fast transitions (<150ms)
- Motion only for state changes, never decoration

**Emotional goal**: User should feel in control, calm, oriented. If the dashboard creates anxiety or excitement, the design failed.

## Technical Decisions Needed

Before starting development, lock in:

1. **Frontend framework** - Recommendation: Next.js (React) for SSR + API routes
2. **Auth approach** - Cloudflare Access vs NextAuth.js vs simple password gate
3. **Deployment target** - Vercel, Cloudflare Pages, or other (must be GitHub-based)
4. **Charting library** - Recharts (React-friendly) or Victory
5. **Database access** - Direct connection vs connection pooler vs edge functions
6. **User data schema** - New tables for holdings and manual assets

## Out of Scope (Explicit)

Do NOT implement:
- Graph databases
- News ingestion or NLP
- Financial statement parsing
- DCF valuation models
- Alerts or notifications
- Mobile optimization
- Multi-user support
- Password recovery flows

## V1 Exit Criteria

V1 is complete when:
- Dashboard loads reliably
- Stocks can be added/removed
- Portfolio state is visible and usable
- Actually used for 2-3 weeks consistently

Only after this is proven should V2 features be discussed.

## Development Philosophy

- **Hard stop once dashboard meets goals** - resist feature creep
- **No V2 work until V1 usage is proven** - behavioral validation first
- **If a visual element doesn't improve comprehension, remove it**
- **No abstractions for hypothetical future requirements**

## Reference Documentation

See `docs/prd.md` for complete product requirements including:
- Full data model field definitions
- Detailed UX specifications
- Success metrics and behavioral goals
