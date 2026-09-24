# CLAUDE.md — Project Constitution

**Project:** Restructure of the Bethel Transformation Center client entry funnel (`/start`)
**Operator:** System Pilot — B.L.A.S.T. protocol + A.N.T. 3-layer build
**State:** 🟢 Blueprint APPROVED (2026-09-24). Phases L(mock) → A → S in progress.

---

## 1. Layout

```
CLAUDE.md          Constitution + state
.env               Credentials (never committed; see .env.example)
/memory/           task_plan · findings · progress · decisions
/architecture/     Layer A — SOPs (update BEFORE code)
/execution/        Layer T — deterministic, atomic, tested scripts
/.tmp/             Ephemeral workbench (gitignored)
```

## 2. Data Schema — ✅ CONFIRMED (2026-09-24)

Catalog values (services, prices, languages, ministers) live in `config/catalog.json`; enums below are validated against it.

### Input — `StartSubmission` (POST `/api/submit`)
```json
{
  "crisis_flag": false,
  "service": "sozo | art_sozo | deliverance | counseling | emdr | brainspotting | trauma | coaching | addiction",
  "format": "in_person | virtual",
  "language": "en | es | tr | zh-TW | da",
  "preferred_minister": "minister_id | null",
  "age_group": "adult | minor",
  "discount_group": "none | bethel_staff | bethel_student",
  "contact": {
    "first_name": "string (1-80)",
    "last_name": "string (1-80)",
    "email": "valid email",
    "phone": "string | null",
    "country": "ISO-3166 alpha-2",
    "timezone": "IANA tz"
  },
  "consents": { "terms": true, "communications": "boolean" },
  "ui_locale": "en | es"
}
```
Server adds `submission_id` (uuid) and `submitted_at` (ISO-8601).
Referrers and training/course visitors are routed by links on the first screen and never submit (not part of this schema).

### Output — `RoutedIntake`
```json
{
  "submission_id": "uuid",
  "submitted_at": "ISO-8601",
  "status": "fast_track | manual_match | needs_review | rejected_invalid | crisis_redirect",
  "lane": "sessions | addiction | null",
  "reasons": ["machine-readable reason codes"],
  "eligible_ministers": ["minister_id"],
  "price_usd": 115,
  "duration_min": null,
  "discount_note": "string | null",
  "next_step": "book_now | await_match | crisis_resources | fix_errors",
  "handoff_url": "string | null",
  "sla_business_days": 3,
  "notifications": [{ "channel": "email", "to": "client | team", "template": "string" }],
  "errors": [{ "field": "string", "code": "string" }]
}
```

## 3. Behavioral Rules — ✅ CONFIRMED (Q5)
1. **Fast-trackable services:** `sozo`, `art_sozo`, `coaching`, `counseling`. All others always `manual_match`.
2. **Fast track minister choice:** client picks among eligible ministers; none picked → booking system assigns.
3. **Crisis gate first:** mandatory "immediate danger?" question before anything else. Yes → stop, show 988 / 911 / international resources, no sales content, nothing stored.
4. **Tone:** warm, Christian, plain language. No pressure, no fake urgency. Price shown before any booking step.
5. **Never:** diagnose, promise healing/outcomes, collect health details beyond what routing needs, touch card data.
6. **Minors:** `age_group=minor` → `manual_match` with guardian notice.
7. **UI languages:** EN + ES in demo; structure ready for zh-TW, tr, da.
8. **Privacy:** explicit consent before submit; demo shows "not a HIPAA system — prototype" notice.
- Never guess business logic; unknown → `needs_review` with a reason code, never a silent default.
- Manual lane: final minister match is human (D-003). Fast track only when eligibility is fully deterministic (D-008).
- Prices, languages, services come ONLY from `config/catalog.json`.

## 4. Architectural Invariants
- Every external system sits behind an adapter interface; the default adapter is a **mock** that writes to `/.tmp/` (D-004).
- No client-real data in the repo; demo *client* submissions are synthetic.
- Every deployed demo shows a visible "Concept prototype — not affiliated with or endorsed by Bethel" label until Bethel adopts it.
- Tools in `/execution/` are deterministic and individually testable.
- Credentials only in `.env`.
- All intermediate files in `/.tmp/`.
- Logic change ⇒ update the `/architecture/` SOP first, then code.
- Every output ships with a test, screenshot, or one-line verify command.

## 5. B.L.A.S.T. Phase Outputs

| Phase | Output | Status |
|---|---|---|
| **B** Blueprint | North Star, integrations, source of truth, payload, rules, confirmed schema | ✅ Approved 2026-09-24 |
| **L** Link | Probe scripts per integration (written, run by integrator) | ⏸ Deferred — mock mode |
| **A** Architect | SOPs + tools + tests | 🔨 In progress |
| **S** Stylize | Restructured `/start` page + dashboard + report, user sign-off | 🔨 In progress |
| **T** Trigger | Deployment + triggers + maintenance log | ⏳ After sign-off |

### Discovery answers
- **Context (Q1, 2026-09-24):** portfolio piece, with intent to pitch/sell to Bethel TC. Must be either integrated or *integration-ready* for a third party to plug in.
- **North Star:** A working, demo-ready prototype of the new `/start` that takes a client from first click to a validated, routed `RoutedIntake` payload in **one flow (<3 min, 1 form)**, where swapping the mock backend for real systems requires **only `.env` + one adapter file per integration** — no changes to logic or UI.
- **Integrations (Q2, revised):** `/start` is an **intake layer in front of SimplePractice** (their existing HIPAA practice system). Live connection deferred (D-006); `ADAPTER_MODE=mock` by default.
  | Role | Primary | Alternative adapter | Status |
  |---|---|---|---|
  | Booking/payment handoff | SimplePractice client portal / booking widget link | Cal.com booking link (Stripe via Cal.com's Stripe app — no code) | ⏸ handoff |
  | Intake record | mock `.tmp/intakes/` | Google Sheets (⚠ not for PHI — demo only) | ⏸ handoff |
  | Notification email | mock `.tmp/outbox/` | Resend | ⏸ handoff |
  | Hosting | local `node execution/server.mjs` | Vercel (Phase T) | — |
- **Source of Truth (Q3):**
  - Intake records → Google Sheets (live) / `.tmp/intakes/*.json` (mock).
  - Catalog (services, prices, durations, formats, languages, discounts, ministers) → `config/catalog.json`, versioned in repo (default applied; user did not pick — D-007). Pages and routing read ONLY from it.
  - Ministers: **real names allowed** (user), taken verbatim from the public `/team` page. Per-minister attributes (services, languages, formats) only as published there; anything not published = `null` + `needs_review`, never invented.
- **Delivery Payload (Q4):** all four deliverables —
  - **A.** Live `/start` on a public URL (Vercel), end-to-end in mock mode.
  - **B.** Team dashboard: incoming intakes + suggested routing.
  - **C.** Before/after pitch report (current funnel vs new).
  - **D.** Handoff-ready codebase + integration guide.
- **Post-submit flow (Q4 = option 3, hybrid):**
  - **Fast track** → client pays (Stripe) + books (Cal.com) immediately, when ALL hold: service is fast-trackable, and ≥1 minister in `catalog.json` has *published* service ∧ language ∧ format matching the request, and no crisis flag, and no preferred minister conflict.
  - **Manual match** → confirmation screen with next steps + SLA (1–3 business days); team matches in dashboard (current "prayerful match" preserved).
  - Rule precision (fast-trackable services, who picks the minister on fast track) — ⏳ confirm in Q5.
- **Behavioral Rules (Q5):** all 8 proposed rules accepted → §3.

## 6. Triggers
- Manual/dev: `npm start` → http://localhost:3000 (`/`, `/dashboard.html`, `/report.html`).
- Tests: `npm test`.
- Production trigger: form POST `/api/submit` (Phase T).

## 7. Maintenance Log
- 2026-09-24 — Constitution initialized. Target site egress-blocked in this container; research from search indexes.
