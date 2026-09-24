# Architectural Decisions

## D-001 — Research from search indexes while the site is egress-blocked
- **Context:** Container cannot reach the target domain.
- **Decision:** Proceed with Protocol 0 + Blueprint using indexed data; tag unconfirmed facts `UNVERIFIED`.
- **Reason:** Blueprint questions don't depend on live HTML; Phase L will require live access anyway.

## D-002 — Draft (not final) data schema in CLAUDE.md
- **Context:** Data-First rule requires a schema before code; business logic must not be guessed.
- **Decision:** Publish a DRAFT schema derived from the observed funnel, explicitly marked unconfirmed.
- **Reason:** Gives the user something concrete to correct during Discovery. Nothing is built on it until confirmed.

## D-003 — Human stays in the loop for minister matching
- **Status:** PROPOSED (pending Q5 Behavioral Rules)
- **Decision:** Deterministic routing only *pre-filters* eligible ministers (service × language × format); the final match remains a human decision.
- **Reason:** Current process is explicitly "prayerful matching" — automating the final choice would change business logic.

## D-004 — Integration-ready via adapters, mock by default
- **Context:** Q1 answer — portfolio project, may be sold to Bethel TC; must be integrated or ready for someone else to integrate. No access to their credentials.
- **Decision:** Each external dependency (form storage/CRM, email, booking, payments) is a small adapter behind a fixed interface. Ship a `mock` adapter (writes JSON to `/.tmp/`) as default; real adapters are added per integration with credentials in `.env`.
- **Reason:** Demo works end-to-end with zero credentials; the handoff to a buyer's developer is "implement one file + fill `.env`", which is the selling point.

## D-005 — Provider selection (Q2)
- Storage: **Google Sheets** (user choice) — legible to a non-technical ministry team.
- Email: **Resend**. Booking: **Cal.com**. Payments: **Stripe test mode** (user had no preference; chosen for free test keys + hosted checkout). Hosting: Vercel (tentative).
- Each sits behind its adapter; `ADAPTER_MODE=mock|live` switches globally.

## D-006 — Defer live integrations; ship integration-ready
- **Context:** User asked to skip credentials/connection now and leave it ready for someone else to connect.
- **Decision:** Phase L runs against mock adapters only. For each provider we still write: the live adapter, a probe script (`execution/probe_<provider>.py`), and an SOP section "How to connect" (`architecture/integrations.md`). Live adapters are unverified until an integrator runs the probes.
- **Reason:** Keeps the North Star (swap = `.env` + adapter) true, without blocking the build on credentials. Risk: unverified live code — mitigated by probes + clear `UNVERIFIED` labels.
