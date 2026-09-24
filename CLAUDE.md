# CLAUDE.md — Project Constitution

**Project:** Restructure of the Bethel Transformation Center client entry funnel (`/start`)
**Operator:** System Pilot — B.L.A.S.T. protocol + A.N.T. 3-layer build
**State:** 🔴 Phase B (Blueprint) — HALTED awaiting Discovery answers. Writing logic in `/execution/` is forbidden.

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

## 2. Data Schema — ⚠ DRAFT, NOT CONFIRMED

Derived from the observed funnel (see `memory/findings.md §6`). Must be confirmed by the user before any code.

### Input — `StartSubmission`
```json
{
  "submission_id": "uuid",
  "submitted_at": "ISO-8601",
  "audience": "client | referrer | training",
  "service": "sozo | art_sozo | deliverance | counseling | emdr | brainspotting | trauma | coaching | addiction",
  "format": "in_person | virtual",
  "language": "en | es | tr | zh-TW | da",
  "preferred_minister": "string | null",
  "discount_group": "none | bethel_staff | bethel_student",
  "contact": {
    "first_name": "string",
    "last_name": "string",
    "email": "string",
    "phone": "string | null",
    "country": "ISO-3166 alpha-2",
    "timezone": "IANA tz"
  },
  "consents": { "terms": true, "communications": true },
  "crisis_flag": false
}
```

### Output — `RoutedIntake`
```json
{
  "submission_id": "uuid",
  "status": "accepted | needs_review | rejected_invalid | crisis_redirect",
  "lane": "sessions | addiction | referral | training",
  "eligible_ministers": ["minister_id"],
  "price_usd": 115,
  "duration_min": 60,
  "next_step": "intake_paperwork | consultation_booking | crisis_resources",
  "sla_business_days": 3,
  "notifications": [
    { "channel": "email", "to": "client | team", "template": "string" }
  ],
  "errors": []
}
```

## 3. Behavioral Rules — pending Q5
Provisional invariants (to be confirmed):
- Never guess business logic; unknown → `needs_review`, never a silent default.
- Final minister match is human; automation only pre-filters (decision D-003).
- Crisis indicators always short-circuit to crisis resources before any sales/booking content.
- Prices, languages and services come from ONE config source, never hard-coded in pages.

## 4. Architectural Invariants
- Every external system sits behind an adapter interface; the default adapter is a **mock** that writes to `/.tmp/` (D-004).
- No client-real data in the repo; demo data is synthetic.
- Tools in `/execution/` are deterministic and individually testable.
- Credentials only in `.env`.
- All intermediate files in `/.tmp/`.
- Logic change ⇒ update the `/architecture/` SOP first, then code.
- Every output ships with a test, screenshot, or one-line verify command.

## 5. B.L.A.S.T. Phase Outputs

| Phase | Output | Status |
|---|---|---|
| **B** Blueprint | North Star, integrations, source of truth, payload, rules, confirmed schema | ⏳ In discovery (2/5 answered) |
| **L** Link | Probe scripts per integration (written, run by integrator) | ⏸ Deferred — mock mode |
| **A** Architect | SOPs + tools + tests | ⛔ Blocked on B |
| **S** Stylize | Restructured `/start` page + templates, user sign-off | ⛔ Blocked on B |
| **T** Trigger | Deployment + triggers + maintenance log | ⛔ Blocked on B |

### Discovery answers
- **Context (Q1, 2026-09-24):** portfolio piece, with intent to pitch/sell to Bethel TC. Must be either integrated or *integration-ready* for a third party to plug in.
- **North Star:** A working, demo-ready prototype of the new `/start` that takes a client from first click to a validated, routed `RoutedIntake` payload in **one flow (<3 min, 1 form)**, where swapping the mock backend for real systems requires **only `.env` + one adapter file per integration** — no changes to logic or UI.
- **Integrations (Q2):** providers chosen below. **Live connection DEFERRED by user** — build runs `ADAPTER_MODE=mock`; each live adapter is written to its provider's API contract and left ready to switch on with `.env` (D-006).
  | Category | Provider | Credential status |
  |---|---|---|
  | Intake storage | Google Sheets (service account) | ⏸ deferred (handoff) |
  | Email | Resend | ⏸ deferred (handoff) |
  | Booking | Cal.com | ⏸ deferred (handoff) |
  | Payments | Stripe **test mode** (user: no preference → default) | ⏸ deferred (handoff) |
  | Hosting | Vercel (default, confirm in Phase T) | — |
- **Source of Truth:** _pending_
- **Delivery Payload:** _pending_
- **Behavioral Rules:** _pending_

## 6. Triggers
_None yet (Phase T)._

## 7. Maintenance Log
- 2026-09-24 — Constitution initialized. Target site egress-blocked in this container; research from search indexes.
