---
name: veritasight-investment-design-system
Apply the Veritasight design system when building the investment dashboard for Sri Lankan equities. This system is heavily inspired by Linear, focusing on high-density data, precision, and a calm, professional aesthetic. It ensures consistent use of Veritasight blue (#4C9FFF), dark mode hierarchies, and DM Sans/JetBrains Mono typography for financial data.
allowed-tools: Read, Edit, Write, Grep, Glob
---

# Veritasight Investment Design System

A high-precision, Linear-inspired design system for the Veritasight Sri Lankan equity tracking platform. It is optimized for "Information Density without Clutter," allowing investors to assess portfolio health in under 60 seconds.

## Design Philosophy

**Precision & Calm**: The dashboard is a thinking tool. Avoid "analysis theater." Use color only to signal performance or focus.

**Core Principles**:

* **High Contrast**: White text on near-black backgrounds (#0A0A0A) for maximum readability of raw numbers.
* **Performance-Driven Color**: Veritasight Blue is for interaction; Green/Red is strictly for market performance.
* **Borders over Shadows**: Use subtle #333333 borders to define hierarchy, avoiding heavy drop shadows.
* **Monospace for Metrics**: All financial values, ticker symbols, and timestamps must use JetBrains Mono for perfect vertical alignment in tables.
* **Density over White Space**: Professional financial tools require high data density. Use a tight 4px-based grid.

---

## Visual Palette

### Color Tokens (Dark Mode Primary)

* **Background Primary**: #0A0A0A (Deepest black for page background)
* **Background Secondary**: #1A1A1A (Cards, panel surfaces, table headers)
* **Background Tertiary**: #2A2A2A (Hover states, nested UI elements)
* **Veritasight Blue**: #4C9FFF (Primary accent, active states, focus rings)
* **Success (Gain)**: #10B981 (Market uptrend, positive relative performance)
* **Error (Loss)**: #EF4444 (Market downtrend, negative relative performance)
* **Warning**: #FFB800 (Pending sync, neutral movement)

### Text Hierarchy

* **Primary**: #FFFFFF (Headings, primary metrics, active holdings)
* **Secondary**: #A0A0A0 (Labels, descriptions, muted index data)
* **Muted**: #666666 (Metadata, timestamps, ISIN numbers)

---

## Typography System

### Font Assignments

* **DM Sans Variable**: Standard UI text, navigation, button labels, and section headers.
* **JetBrains Mono**: Strictly for Ticker Symbols (e.g., `JKH.N0000`), Price Values (LKR), Percentages, and ISO Timestamps.

### Scale & Weight

* **Page Title**: 24px, Bold (700), 1.2 Line-height.
* **Section Header**: 18px, Semi-bold (600), 1.3 Line-height.
* **Table Header**: 12px, Medium (500), All-caps, Muted color.
* **Primary Metric**: 14px, Monospace, Medium (500).
* **Caption/Metadata**: 11px, Monospace, Regular (400).

---

## Component Blueprints

### 1. Portfolio Holdings Table

The core surface for equity data. High density is required.

* **Header**: Sticky, background-secondary, subtle bottom border.
* **Row**: Background-primary, transition to background-tertiary on hover.
* **Symbol Column**: Bold JetBrains Mono, Veritasight Blue on hover.
* **Metric Columns**: Right-aligned JetBrains Mono for easier numerical comparison.
* **Inline Editing**: The "Shares Held" field should have a subtle #333333 border, appearing as a text field only on hover or focus.

### 2. Index Overview Cards

Muted context containers for ASPI and S&P SL20.

* **Layout**: Horizontal flex container at the top of the dashboard.
* **Styling**: No background; subtle right-border separator between indices.
* **Logic**: Index values should be visually smaller than the user's total portfolio value to reduce "comparison anxiety."

### 3. Allocation Donut

* **Visual**: Slim stroke width (Linear-style).
* **Legend**: Placed to the right, using DM Sans for asset names and JetBrains Mono for percentages.
* **Inclusion**: Must visually distinguish between Equity (Live data) and Manual Assets (Cash/Bonds).

### 4. Performance Charts

* **Line Styling**: 2px stroke width. Primary stock in Veritasight Blue.
* **Index Overlay**: Dashed or 1px solid line in #444444 (Muted) to provide context without distraction.
* **Normalization**: Rebase to 100 for "Portfolio vs Index" comparisons.
* **Grid**: Only horizontal grid lines, color #1A1A1A.

### 5. Status & Performance Badges

* **Gain/Loss**: Use a subtle 10% opacity background of the success/error color with a solid 1px border.
* **Relative Performance**: Small arrow icons (↑/↓) next to percentages when comparing against ASPI.

---

## Layout & Interaction Rules

### Spacing Scale

* **4px (1)**: Icon to text gap.
* **8px (2)**: Between grouped metrics.
* **12px (3)**: Vertical padding in table rows.
* **24px (6)**: Main section margins and card padding.

### Interaction Speed

* **Hover/Focus**: 150ms-200ms duration.
* **Transitions**: Linear-style "Slide-up" for modals (300ms) with a 60% opacity black backdrop blur.

### Responsive Behavior

* **Desktop-First**: The primary experience is for deep-dive review on large screens.
* **Table Scaling**: On smaller screens, prioritize Symbol, Price, and Total Value; hide metadata like ISIN or MTD Volume.

---

## Implementation Checklist

### Visual Integrity

* [ ] Background is #0A0A0A, not pure black or neutral gray.
* [ ] All monetary values are in JetBrains Mono.
* [ ] Primary buttons use Veritasight Blue (#4C9FFF).
* [ ] Borders are #333333 (Subtle) or #444444 (Prominent).

### Functional Clarity

* [ ] Market data (LTP) is visually distinct from user-entered data (Shares Held).
* [ ] Gain/Loss colors are used only for price movement.
* [ ] Portfolio total includes Manual Assets (Cash/Bonds).
* [ ] Index data is visually muted compared to personal holdings.

### Accessibility

* [ ] Focus rings are visible and use Veritasight Blue.
* [ ] Contrast ratio for primary text exceeds 7:1.
* [ ] Table headers are clearly mapped to data for screen readers.

---

## Resources

- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [DM Sans Variable Font](https://fonts.google.com/specimen/DM+Sans)
- [JetBrains Mono Font](https://fonts.google.com/specimen/JetBrains+Mono)
- [Lucide Icons](https://lucide.dev/)
- [Linear Design System](https://linear.app/design)

**Remember**: Veritasight blue (#4C9FFF) is your signature. Use it with intention on primary actions and active states. Embrace Linear's philosophy: high contrast, minimal color, clean spacing, and subtle interactions. Keep it fast (200ms), keep it clean, keep it professional.
