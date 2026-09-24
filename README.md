# /start — intake redesign (concept prototype)

> **Concept prototype — not affiliated with or endorsed by Bethel.** Portfolio piece proposing a one-flow intake for the Bethel Transformation Center `/start` page. Not a HIPAA system; use test data only.

**What it does:** a single form (safety check → service → fit → contact) that validates and routes every request deterministically:
- **Fast track:** Sozo, Art Sozo, Counseling and Coaching book right away when a minister's published language and format match the request.
- **Manual match:** the team matches the client prayerfully, and the client is told the timeline (3 business days).
- **Crisis:** a "yes" at the safety check shows 988/911 resources and stores nothing.

## Run it
```bash
npm start        # http://localhost:3000  (/ · /dashboard.html · /report.html)
npm test         # 17 routing/adapter tests
npm run e2e      # browser E2E + screenshots → docs/screenshots/ (server must be running)
```
Needs Node ≥ 20. There are no dependencies.

## Layout (B.L.A.S.T. / A.N.T.)
| Path | Role |
|---|---|
| `CLAUDE.md` | Project constitution: schema, rules, state |
| `architecture/` | SOPs: routing table, page flow, how to connect integrations |
| `config/catalog.json` | Single source of truth: services, prices, languages, ministers |
| `execution/lib/` | Deterministic tools: `validate`, `route`, `intake` pipeline |
| `execution/adapters/` | Mock (default) and live adapters: Sheets, Resend |
| `execution/probe_*.mjs` | Connection probes for integrators |
| `web/` | `/start`, team dashboard, before/after report |
| `memory/` | Findings, decisions, progress log |

## Connect it for real
See [`architecture/integrations.md`](architecture/integrations.md). In short:
1. `cp .env.example .env`, then set `SIMPLEPRACTICE_BOOKING_URL`.
2. Fill in each minister's `services`, `languages` and `formats` in `config/catalog.json`, then remove `demo_placeholder`.
3. Optionally set the Sheets and Resend keys and `ADAPTER_MODE=live`, then run `npm run probe`.
4. Set `DASHBOARD_TOKEN` before exposing the dashboard.
