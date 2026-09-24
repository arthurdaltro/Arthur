# Progress Log

## 2026-09-24 — Protocol 0
- Repo was empty (branch `claude/system-pilot-blast-qa90sb`, no commits).
- Created project skeleton: `CLAUDE.md`, `/memory/*`, `/architecture/`, `/execution/`, `/.tmp/`, `.env.example`, `.gitignore`.
- **Error:** `curl https://www.betheltransformationcenter.com/start` → `CONNECT tunnel failed, response 403` (egress proxy `connect_rejected`). WebFetch → `EGRESS_BLOCKED`. Same for `www.bethel.com`.
  - Root cause: container network policy, not the site.
  - Workaround: research via WebSearch indexes; findings flagged `UNVERIFIED` where needed.
  - Fix for later: add `betheltransformationcenter.com` (+ `courses.` subdomain) to the environment's allowed domains.
- Deep dive logged in `findings.md`.
- HALT: waiting on Blueprint Discovery Q1 (North Star).

## Tests run
- None yet (no logic permitted before Blueprint approval).

## 2026-09-24 — Blueprint Q1 answered
- User: portfolio project, intends to pitch to Bethel TC; must be integrated or left integration-ready.
- North Star recorded in CLAUDE.md; decision D-004 (adapters + mock default) logged.
- Next: Q2 Integrations.

## 2026-09-24 — Blueprint Q2 (partial)
- User: integrate every category for real. Pending: provider choice per category + credential readiness.
- Providers chosen: Sheets, Resend, Cal.com, Stripe (test), Vercel (tentative). `.env.example` expanded. Pending: credential readiness.
- User deferred live integrations (D-006). Build proceeds in mock mode; probes + "how to connect" SOP to be delivered for the integrator. Q2 closed.
- Q3 answered: real minister names OK. Catalog default = `config/catalog.json` (D-007). Only 3 names recoverable via search; full roster blocked by egress.
- Q4 answered: deliverables A+B+C+D; hybrid flow (option 3). Schema status/next_step updated (D-008).
- User asked which Phase B items already exist today. New research: they run SimplePractice (telehealth + client portal); 988 in FAQ; minors served. Logged findings §10–11; flagged provider-choice conflict (Sheets not HIPAA; duplication with SimplePractice).

## 2026-09-24 — Blueprint approved
- Q2 revised to "front of SimplePractice" (D-009); Q5 all accepted (D-010). Schema confirmed in CLAUDE.md. Starting Phase A/S build.

## 2026-09-24 — Phase A build
- SOPs written first: architecture/intake_routing.md, integrations.md, start_page_content.md.
- Catalog `config/catalog.json`; tools validate/route/intake; adapters mock (storage, email) + live (Sheets, Resend); probes handoff/sheets/resend; zero-dep server.
- Error: `node --test tests/` → MODULE_NOT_FOUND (Node 22 treats a dir arg as a module). Fix: glob `tests/*.test.mjs`.
- Tests: `npm test` → 17/17 pass (routing table rows 1–9, determinism, sanitize, mock e2e, live-mode guard).
- Phase L (mock): mock adapters green via e2e test. Live probes written, NOT run (D-006, egress blocked).

## 2026-09-24 — Phase S
- Built web/index.html (+app.js, i18n.js EN/ES, styles.css light/dark), dashboard.html, report.html.
- E2E `npm run e2e` (Playwright): safety, crisis, validation errors, fast track, manual, ES mobile, dashboard, report → GREEN. 10 screenshots in docs/screenshots/.
- Issue: first result screenshots captured mid fade-in animation. Fix: E2E context uses reducedMotion 'reduce' (also exercises a11y path).
- Issue: dashboard reason column clipped → human-readable, wrapping.
- Awaiting user sign-off → Phase T (Vercel).
