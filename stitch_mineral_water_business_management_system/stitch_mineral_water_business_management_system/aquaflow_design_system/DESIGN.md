---
name: Panniwalay Design System
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#3f4850'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#707881'
  outline-variant: '#bfc7d2'
  surface-tint: '#006398'
  primary: '#006194'
  on-primary: '#ffffff'
  primary-container: '#007bb9'
  on-primary-container: '#fdfcff'
  inverse-primary: '#93ccff'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#825100'
  on-tertiary: '#ffffff'
  tertiary-container: '#a36700'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#cce5ff'
  primary-fixed-dim: '#93ccff'
  on-primary-fixed: '#001d31'
  on-primary-fixed-variant: '#004b73'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  title-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 22px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
  tabular-data:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 0.75rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system drives a modern, high-precision ERP and logistics routing platform engineered for mineral water bottling plants, bulk distributor hubs, and direct-to-door delivery operations. The interface must balance operational density with refreshing, crystalline clarity. The visual identity reflects the purity, hydration, and fluid efficiency of mineral water logistics: immaculate white foundations, crystalline oceanic accents, and distinct status signals.

The target audience comprises fleet dispatchers, warehouse stock managers, route delivery drivers, and B2B corporate account administrators. These users require frictionless workflows under demanding logistical conditions—from fast barcode and RFID empty-bottle handoffs on mobile devices to dense dispatch grids and ledger balance views on multi-monitor desktop workstations.

The emotional baseline is dependable, pristine, and alert. It eschews gratuitous visual noise in favor of a crisp, modern SaaS paradigm:
- **Clean Precision:** Utilitarian clarity derived from balanced typography and structured borders.
- **Hydrated Tactility:** Subtle aqueous color accents, crystal-tinted surface tiers, and calm atmospheric elevation.
- **Logistical Velocity:** High visual scannability for numeric inventories, route stages, and returned bottle collateral.

## Colors

The color palette centers around aquatic depth, spring purity, and real-time operational status clarity:

- **Primary (`#0284C7` - Oceanic Sky):** Represents core dispatch workflows, primary interactive buttons, active route strokes, and navigation anchors. Supported by `#0369A1` for pressed/deep states and `#0EA5E9` for focus rings and dynamic hover surfaces.
- **Secondary (`#10B981` - Emerald Spring):** Encodes operational completions, confirmed drop-offs, full-pallet stock replenishment, and healthy accounts balance.
- **Tertiary (`#F59E0B` - Deposit Amber):** Specifically dedicated to tracked inventory friction points: pending returnable 5-gallon carboys, overdue deposit reconciliations, and maintenance alerts for sanitization lines.
- **Neutral (`#0F172A` - Slate Abyss):** The grounding dark neutral used for text hierarchies, deep table headers, and structural division lines. 

Surface tiers rely on cool-tinted neutrals:
- Background base: `#F8FAFC` (pure spring tint)
- Card surface: `#FFFFFF`
- Surface sub-tier / Table header: `#F1F5F9`
- Subtle divider borders: `#E2E8F0`
- Active selection fills: `#E0F2FE` (tinted cyan wash)

## Typography

Typography pairs Plus Jakarta Sans for titles and display levels with Inter for data density, controls, and body copy.

All numeric elements, including bottle balances, fleet odometer logs, customer credit sums, and invoice line items, must apply `font-variant-numeric: tabular-nums` to guarantee vertical column alignment across dense ERP tables and KPI cards.

Headings feature tight tracking to project confidence and structure. Body levels maintain generous vertical line height to prevent ocular fatigue when scanning large delivery manifest batches.

## Layout & Spacing

The layout model is governed by an 8pt architectural rhythm with a 4pt micro-adjustment baseline:

- **Desktop (1200px+):** 12-column responsive fluid grid with 2rem outer canvas margins and 1.5rem gutters. Provides dual-pane views (e.g., live route map on the left, delivery stop order roster on the right).
- **Tablet (768px - 1199px):** 8-column layout with 1.5rem margins and 1rem gutters. Side navigation drawers collapse to icons, and metric summary strips collapse from 4-across to 2x2 cards.
- **Mobile (<768px):** 4-column layout with 1rem margin and 0.75rem gutters. Dedicated to mobile drivers and field reps, utilizing sticky bottom confirmation action bars and stacked vertical manifests.

Density modes can be toggled in data grids: Compact (36px row height with `space-xs` padding) for bulk dispatching, and Standard (48px row height with `space-sm` padding) for billing and client management.

## Elevation & Depth

Visual hierarchy uses a crisp hybrid approach combining soft, cyan-tinted ambient shadows with low-contrast structural outlines (`#E2E8F0`). This anchors UI components securely on clean backgrounds without heavy blur occlusion:

- **Level 0 (Flat):** Canvas background (`#F8FAFC`). No shadow. Table row divisions and form field tracks sit at this level.
- **Level 1 (Resting Cards & Tiles):** `box-shadow: 0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(2, 132, 199, 0.05);` paired with a 1px border of `#E2E8F0`. Used for data tables, metric tiles, and standard modules.
- **Level 2 (Hover & Active Drag):** `box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.07), 0 2px 4px -2px rgba(2, 132, 199, 0.08);` with border transition to `#CBD5E1`. Used for draggable route stops, interactive card hovers, and dropdown popovers.
- **Level 3 (Modals & Slide-out Panels):** `box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(2, 132, 199, 0.06);`. Used for customer profile flyouts, route reassignments, and batch invoice generation windows.

## Shapes

The design system adopts a balanced roundedness (Level 2). Standard UI surfaces utilize `0.5rem` (8px) border radius to convey crisp, professional efficiency. 

- **Inputs, Buttons, and Table Containers:** 8px (`0.5rem`) for standard integrity.
- **KPI Cards & Modal Shells:** 12px–16px (`0.75rem`–`1rem`) to present clear enclosure of grouped information.
- **Badges, Tags, and Status Pills:** Fully rounded (`9999px`) to visually differentiate quick status metadata from interactive cards and inputs.

## Components

### Buttons
- **Primary:** Background `#0284C7`, text `#FFFFFF`, border-radius 8px, font weight 600. Hover state `#0369A1`. Focus outline uses `#0EA5E9` with 3px ring offset.
- **Secondary (Stock / Confirm):** Background `#10B981`, text `#FFFFFF`. Hover `#059669`. Used for delivery completion and stock check-in.
- **Tertiary / Outline:** White surface, border 1px solid `#CBD5E1`, text `#0F172A`. Hover background `#F8FAFC`.
- **Ghost:** Transparent background, text `#0369A1`. Hover background `#E0F2FE`.

### Status Chips & Badges
All status chips feature full-pill geometry (`rounded-full`), small bold uppercase labels (`label-sm`), and a 12px height alignment dot:
- **Completed / Full Stock:** Background `#ECFDF5`, text `#047857`, border `#A7F3D0`.
- **Pending Empty Deposit:** Background `#FFFBEB`, text `#B45309`, border `#FDE68A`.
- **En Route / Active:** Background `#F0F9FF`, text `#0369A1`, border `#BAE6FD`.
- **Overdue / Damaged Bottle:** Background `#FEF2F2`, text `#B91C1C`, border `#FECACA`.

### Metric KPI Cards
- Crisp white surface with Level 1 elevation and 1px `#E2E8F0` border.
- Card structure: top row houses the category label (`label-md` uppercase in `#64748B`) alongside a mini aqueous icon badge; middle row displays a prominent tabular value (`display-lg` in `#0F172A`); bottom row features contextual delta metadata (e.g., `+18.4% bottles recycled` in emerald text).

### Data Tables
- Crisp, dense layout. Sticky table header filled with `#F8FAFC`, uppercase `label-sm` text color `#475569`, 1px solid horizontal border `#E2E8F0`.
- Rows feature subtle hover highlighting (`#F0F9FF`/40%). Numbers (Gallons, Units, Deposits, Currency) are right-aligned with Inter tabular fonts.

### Checkboxes & Selection Controls
- Checkbox borders use 1.5px `#94A3B8`, with 4px border radius. Checked state fills with `#0284C7` containing a white check icon.
- Radio buttons maintain standard 50% border radius with a concentric `#0284C7` dot on active selection.

### Form Inputs
- Height: 40px standard (32px in compact table forms).
- Background `#FFFFFF`, border 1px solid `#CBD5E1`, text `#0F172A`, placeholder `#94A3B8`.
- Focus state: border `#0284C7` with a 3px ring tint of `#E0F2FE`. Integrated leading icons for unit measurement indicators (e.g., 🪣 5-Gal, 🏷️ Lot Code).