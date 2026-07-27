<!-- SEED: established with the user before implementation; re-run $impeccable document once there's code to capture the actual tokens and components. -->

---
name: Facturación Electrónica SUNAT — skill site
description: A dual-pane site where a developer console asks and a stamped government ledger answers.
---

# Design System: Facturación Electrónica SUNAT

## Overview

**Creative North Star: "The Two Terminals"**

Every section of this page is the same exchange, repeated: a dark developer console on one side asks for a document, and a light paper ledger on the other side answers — with SUNAT's own catalog codes, montos math, and a rubber-ink verdict stamped straight from the real CDR response codes (0 = ACEPTADA, 2000–3999 = RECHAZADA). The split is not a decorative two-column layout; it is the product's actual mechanism made visible: you ask in code, the government answers on paper.

Confirmed rejections: no gradient-blob AI-SaaS hero, no centered "automate X ✨" headline over a floating dashboard mockup, no cutesy fintech pastel illustration, no rounded card grid pretending to be a feature list. Both panes stay flat and rectangular — terminals and government paper are not soft objects.

**Key Characteristics:**
- Persistent dual-pane rhythm: console (ask) / ledger (answer), page-wide, not just in the hero.
- One committed ink-red accent doing real semantic work (verdict stamps, rejections, rules), not a UI-safe pastel.
- Spanish domain vocabulary (RUC, IGV, CDR, comprobante, boleta) stays untranslated — it is the product's real register, not flavor text.
- Flat everywhere; depth comes from the seam between panes and the stamp's ink pressure, never from drop shadows.

## Colors

Two grounds in tension — a dark console and a warm paper — joined by one committed ink-red that only ever means "look here, something was judged."

### Primary
- **Dried Stamp Red** (`#9c2b1f`): the verdict-stamp ink, rejection states, and the one accent rule/underline allowed per section. Never softened toward a friendly brand red — it should read as ink pressed into paper, not a UI color chip. Governs 30–60% of any section it appears in (a stamp is a dominant mark, not a corner badge).

### Secondary
- **Ledger Green Ink** (`#2f5233`): the ACEPTADA verdict counterpart to Dried Stamp Red's RECHAZADA. Used only on the stamp component, never as decoration or a generic "success" color elsewhere.

### Neutral
- **Terminal Black** (`#15130f`): the console pane's background — near-black with a warm undertone, not a pure `#000`.
- **Console Cream** (`#e8e2d0`): text, labels, and rules on the console side; a warm phosphor-adjacent off-white, never pure white.
- **Paper** (`#f6f1e7`): the ledger pane's background — a warm document-bond tone.
- **Ledger Ink** (`#211d16`): body text and figures on the paper side — near-black, warm, like real ink on that paper.
- **Aged Rule** (`#8a8272`): divider lines, table rules, and secondary labels on the paper side.
- **Terminal Rule** (`#3a362c`): divider lines and dimmed labels on the console side.

### Named Rules
**The Ink, Not Chrome Rule.** Dried Stamp Red and Ledger Green Ink appear only on verdicts and the rules/underlines directly tied to them. They never become a generic "primary button" color; a CTA is styled as console or ledger material, not a UI-red pill.

## Typography

**Display Font:** Newsreader (serif) — the paper/prose voice.
**Body Font:** Newsreader (serif) for prose; body text on the console side stays in the mono for register consistency within that pane.
**Label/Mono Font:** IBM Plex Mono — the console voice: code, requests, catalog codes, ledger columns, labels, and stamp typography.

**Character:** A bookish, document-grade serif answering a plain, exact monospace — the pairing itself carries the thesis of "your code" versus "their paper." Neither face performs playfulness; both are chosen for being genuinely functional in their own pane.

### Hierarchy
- **Display** (Newsreader, 500, `clamp(2.25rem, 5vw, 4rem)`, 1.05): section-opening claims on the paper side only.
- **Headline** (Newsreader, 500, `clamp(1.5rem, 3vw, 2.25rem)`, 1.15): sub-section titles, paper side.
- **Title** (IBM Plex Mono, 600, `1.125rem`, 1.3, uppercase, `0.02em` tracking): console-side section labels and prompts.
- **Body** (Newsreader, 400, `1.0625rem`, 1.6, max 68ch): paper-side prose and explanation.
- **Label** (IBM Plex Mono, 500, `0.8125rem`, 1.4, `0.04em` tracking, uppercase for chrome labels): catalog codes, field names, status labels, nav.

### Named Rules
**The One Voice Per Pane Rule.** Console panes never render Newsreader; paper panes never render body copy in Plex Mono. Mixing faces within one pane breaks the thesis the pairing exists to carry.

## Layout

Full-bleed dual panes stacked side by side on wide viewports (console left, ledger right — the reading order matches "you ask, they answer"); on narrow viewports the panes stack vertically in the same order, never side-scrolling. The seam between panes is a visible perforation (a thin dashed rule), not a hard hairline — it references the tear-line of an actual printed form. Sections vary pane emphasis (a quiet section can run console-only or ledger-only full-width) but never abandon the two-material vocabulary. Spacing rhythm: generous quiet space around dense catalog/table content so the page still breathes between technical passages.

## Elevation & Depth

Flat by default on both sides — terminals don't cast shadows and neither does paper lying flat. Depth is conveyed structurally: the perforated seam, a slight ink-pressure effect (subtle inset text-shadow) on stamped verdicts only, and paper-side rules that behave like printed lines rather than floating dividers.

### Named Rules
**The Flat Ground Rule.** No drop shadows, no glassmorphism, no floating cards on either pane. If something needs to stand out, it earns that through the stamp, a rule weight, or the red ink — never elevation.

## Shapes

Hard rectangular geometry everywhere except one deliberate exception: the verdict stamp, which is the single circular/oval form on the page, because a rubber stamp is the one genuinely round object in this world. Panels, tables, code blocks, and buttons all carry 0 radius. The perforation is the only broken edge permitted.

## Do's and Don'ts

### Do:
- **Do** keep the console/ledger dual-pane structure through every section, including navigation — a nav bar reads as a terminal title strip, not a floating pill menu.
- **Do** reserve the stamp component for genuine accept/reject-shaped moments (a real CDR-style verdict), never as decoration.
- **Do** keep RUC, IGV, CDR, comprobante, boleta, and other domain terms in Spanish and unglossed-but-explained, matching the real skill's vocabulary.
- **Do** label any illustrative document or response as synthetic/example data — never imply it came from a real SUNAT submission.

### Don't:
- **Don't** round panel corners or add box-shadows to simulate depth; that reads as generic AI-SaaS chrome, exactly what this world refuses.
- **Don't** soften Dried Stamp Red into a pastel or "friendly" brand red — it must feel like pressed ink, not a UI accent chip.
- **Don't** invent testimonials, customer logos, adoption numbers, or case studies anywhere on the page — PRODUCT.md records that none exist.
- **Don't** commit to one specific install command or a real repository URL — the distribution mechanism is explicitly undecided; present installation in a form a real method can slot into later.
