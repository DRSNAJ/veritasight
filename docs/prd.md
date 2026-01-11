# Product Requirements Document (PRD)

**Product Name:** Veritasight

## 1. Executive Summary

This product is a **personal investment dashboard** for tracking publicly listed Sri Lankan equities.

V1 is intentionally narrow.
No predictions. No automation. No analysis theater.

Goal: **one place to see current holdings, key metrics, and index-relative performance at a glance**.

This is not a product yet. It is an internal decision-support surface.

---

## 2. Problem Statement

I own multiple Sri Lankan stocks.

Information about them is fragmented across:

* Exchange data
* Index movements (ASPI / S&P SL20)
* My own memory and notes

I do not have time to read all news or publications daily.

Result:

* Inconsistent review cadence
* Higher cognitive load
* Risk of missing obvious signals

---

## 3. Goals (V1)

**Primary goal**

* See the full state of my current portfolio in under 60 seconds.

**Secondary goals**

* Quickly spot movers vs indices
* Maintain consistency in portfolio review
* Reduce context switching

**Explicit non-goals**

* Valuation models (DCF)
* News ingestion or NLP
* Alerts or recommendations
* Any external users

---

## 4. Success Metrics

This is a personal tool. Metrics are behavioral.

* Dashboard visited at least **3–4 times per week**
* Portfolio state understandable in **<1 minute**
* Zero need to open external tools for basic checks

If this doesn’t happen, V1 failed.

---

## 5. Target User

Single user: me.

Profile:

* Long-term, value-oriented investor
* Limited weekly time
* Comfortable with raw numbers

No abstraction needed for beginners.

---

## 6. Core Use Cases

1. View all current holdings with key metrics
2. Compare stock performance vs ASPI / S&P SL20
3. Add a newly purchased stock
4. Remove a sold stock
5. See basic historical movement (table-level, not charts-heavy)

---

## 7. Functional Requirements

### 7.1 Portfolio Dashboard (Core Surface)

**Intent**: Answer one question fast — *"Where do I stand right now?"*

Each row represents a holding.

#### Stock Holdings

Required fields per stock:

* Symbol
* Name
* Shares held (manual input)
* Last traded price (market)
* Holding value = shares held × last traded price (derived)
* Day change (LKR)
* Day change (%)
* WTD / MTD / YTD %
* Relative performance vs ASPI
* Relative performance vs S&P SL20

Behavioral nuances:

* Shares held is editable inline
* Holding value updates immediately
* Clear visual distinction between **market data** and **user-entered data**

Sorting defaults:

* By holding value (desc)

Optional sorting:

* By % change
* By relative index performance

---

#### Non-Equity Holdings (Manual Assets)

Purpose: Provide a *complete* net-investment view.

Supported asset types (V1):

* Fixed deposits / certificates of deposit
* Bonds
* Cash / savings
* "Other" (free-text label)

Required fields:

* Asset name
* Asset type
* Current value (manual)
* Optional notes

Rules:

* No yield calculations in V1
* No maturity logic
* Treated as static value snapshots

These assets:

* Appear in total portfolio value
* Appear in allocation charts
* Do **not** appear in price-performance graphs

---

### 7.2 Index Overview

**Intent**: Context, not comparison anxiety.

Index summary cards:

* ASPI: value, change, %
* S&P SL20: value, change, %

Behavior:

* Latest available market snapshot
* Visually muted compared to portfolio values

---

### 7.3 Graph Views (Intuition Builders)

Graphs exist to build *intuition*, not signals.

---

#### 7.3.1 Per-Share Price Performance

Line chart:

* X-axis: time
* Y-axis: price per share

Details:

* Multiple stocks on one chart
* Toggle visibility per stock
* Optional index overlays (ASPI, S&P SL20)
* Normalization toggle (rebased to 100)

Subtle rules:

* Default view shows **one stock** (avoids clutter)
* Index lines visually lighter than stocks
* No indicators, no annotations

---

#### 7.3.2 Portfolio vs Index (Aggregate)

Normalized comparison:

* Portfolio value (equities + manual assets)
* ASPI
* S&P SL20

Details:

* All rebased to same starting date
* Portfolio line weighted by holding value

Purpose:

* Directional sanity check
* Detect prolonged underperformance

---

### 7.4 Portfolio Composition

Donut chart:

* Allocation by asset

Views:

* By individual holding
* By asset class (equity vs cash vs fixed income)

Details:

* Based on **current value**, not cost basis
* Percentages and absolute LKR shown

Nuance:

* Manual assets included
* Indexes excluded

---

### 7.5 Quick Visuals (Optional, Disposable)

Strictly optional:

* Top gainers / losers (daily)
* Simple heatmap by % change
* Market-cap-weighted distribution

Rule:

* If not glanced at weekly, remove.

---

### 7.6 Data Entry & Persistence

User-entered data:

* Shares held per stock
* Manual asset values
* Notes (lightweight text)

Persistence rules:

* Stored separately from raw market data
* Editable without touching ingestion tables

---

### 7.7 Authentication & Access Control

Purpose:

* Prevent accidental public exposure

Model:

* Single-user
* Login gate only

Constraints:

* Cloudflare-compatible
* GitHub-based deployment

No:

* Multi-user support
* Role systems
* Password recovery

---

## 8. Data & Architecture (V1 Scope)

Data source:

* Existing hourly-ingested Postgres tables

Tables used:

* ticker_raw_data
* index_raw_data

Assumptions:

* Data correctness is "good enough"
* No backfills required

No schema changes required for V1.

---

## 9. UX & Design Principles

**Design Inspiration:** Linear (linear.app)

Veritasight should feel:

* Calm
* Fast
* Precise
* Effortless

This is a **thinking tool**, not a visual playground.

---

### 9.1 Core Design Principles

* **Clarity over decoration**
* **Speed over flourish**
* **Consistency over novelty**
* **Density without clutter**

If a UI element does not improve comprehension, it is removed.

---

### 9.2 Visual Language (Linear-Inspired)

* Neutral color palette (grays, off-whites)
* Subtle accent color only for focus or selection
* Flat surfaces, minimal borders
* Soft shadows only where necessary for hierarchy

No gradients. No gloss. No visual noise.

---

### 9.3 Typography

* Clean sans-serif font
* Clear hierarchy via size and weight, not color
* Numbers aligned and easy to scan

Tables must be readable at a glance.

---

### 9.4 Layout & Interaction

* Desktop-first
* Keyboard-friendly
* Instant feedback on edits (e.g., shares held)
* No modal overload

Every interaction should feel intentional and reversible.

---

### 9.5 Motion & Feedback

* Minimal motion
* Fast transitions (<150ms)
* Motion only to indicate state change, never decoration

---

### 9.6 Emotional Goal

The dashboard should make the user feel:

* In control
* Calm
* Oriented

If it creates anxiety or excitement, the design failed.

---

## 10. Risks

* Overbuilding beyond V1
* Turning this into a side-project sinkhole
* Adding features that don’t change decisions

Mitigation:

* Hard stop once dashboard meets goals
* No V2 work until V1 usage is proven

---

## 11. Out of Scope (Explicit)

* Graph databases
* News ingestion
* Financial statement parsing
* DCF valuation
* Alerts
* Mobile optimization

These are future discussions, not commitments.

---

## 12. V1 Exit Criteria

V1 is complete when:

* Dashboard loads reliably
* Stocks can be added/removed
* Portfolio state is visible and usable
* I actually use it for 2–3 weeks

Only then does V2 get discussed.

---

## 13. Data Model References (V1)

This section documents the **existing raw tables** used as data sources for V1.
These tables are *not owned* by the product layer and should not be modified for V1.

### 13.1 `ticker_raw_data`

**Purpose**: Raw, hourly-ingested equity data for individual listed companies.

#### Identity & Metadata

* `id` (INTEGER, PK)
* `timecreated` (TIMESTAMP)
* `ticker_id` (TEXT)
* `symbol` (TEXT)
* `name` (TEXT)
* `isin` (TEXT)
* `issuedate` (DATE)

#### Capital Structure

* `quantityissued` (BIGINT)
* `parvalue` (NUMERIC)
* `marketcap` (NUMERIC)
* `marketcappercentage` (NUMERIC)

#### Pricing (Current & Reference)

* `lasttradedprice` (NUMERIC)
* `previousclose` (NUMERIC)
* `closingprice` (NUMERIC)
* `hitrade` (NUMERIC)
* `lowtrade` (NUMERIC)
* `change` (NUMERIC)
* `changepercentage` (NUMERIC)

#### High Prices (By Period)

* `wtdhiprice`
* `mtdhiprice`
* `ytdhiprice`
* `p12hiprice`
* `allhiprice`

#### Low Prices (By Period)

* `wtdlowprice`
* `mtdlowprice`
* `ytdlowprice`
* `p12lowprice`
* `alllowprice`

#### Volume & Trading Activity

* `tdysharevolume`
* `wdysharevolume`
* `mtdsharevolume`
* `ytdsharevolume`
* `p12sharevolume`
* `symbolindexsharevolume`
* `tdytradevolume`
* `tdyturnover`
* `wtdturnover`
* `mtdturnover`
* `ytdturnover`

#### Portfolio-Specific

* `sharesHeld` (INTEGER)

---

### 13.2 `index_raw_data`

**Purpose**: Raw, hourly-ingested index-level market data (ASPI, S&P SL20).

#### Identity & Metadata

* `id` (INTEGER, PK)
* `ticker_id` (TEXT)
* `ticker` (TEXT)
* `sectorid` (TEXT)
* `timestamp` (TIMESTAMP)
* `timeCreated` (TIMESTAMP)

#### Index Values

* `value` (NUMERIC)
* `lowvalue` (NUMERIC)
* `highvalue` (NUMERIC)
* `change` (NUMERIC)
* `percentage` (NUMERIC)

---

**Notes**:

* These tables are treated as immutable raw sources.
* UI and business logic should rely on views or read models derived from them.
* Any schema evolution belongs outside V1 scope.
