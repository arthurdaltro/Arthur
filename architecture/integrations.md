# SOP — Integrations (How to connect)

All external systems sit behind adapters in `execution/adapters/`. `ADAPTER_MODE=mock` (default) needs no credentials. Set `ADAPTER_MODE=live` and the variables below to switch. **Live adapters are UNVERIFIED until the probe passes.**

| Adapter | Interface | Mock | Live | Probe |
|---|---|---|---|---|
| storage | `save(intake)`, `list()` | JSON files in `.tmp/intakes/` | Google Sheets append (`storage_sheets.mjs`) | `node execution/probe_sheets.mjs` |
| email | `send({to, template, intake})` | JSON files in `.tmp/outbox/` | Resend (`email_resend.mjs`) | `node execution/probe_resend.mjs` |
| handoff | booking URL in `catalog.handoff` | placeholder URL | SimplePractice booking widget / Cal.com link | `node execution/probe_handoff.mjs` |

## 1. SimplePractice (primary handoff)
SimplePractice has no public write API, so the handoff is a link.
1. In SimplePractice: *Settings → Client Care → Online appointment requests* → enable, copy the booking widget URL (usually `https://<practice>.clientsecure.me`).
2. `.env`: `SIMPLEPRACTICE_BOOKING_URL=<that url>`.
3. Payments, card on file and intake paperwork stay in SimplePractice — no Stripe code needed.
4. Run `node execution/probe_handoff.mjs` → expects HTTP 2xx/3xx.

## 2. Google Sheets (alternative intake log — ⚠ not for PHI)
1. Google Cloud → create project → enable **Google Sheets API** → create service account → JSON key.
2. `base64 -w0 key.json` → `.env` `GOOGLE_SERVICE_ACCOUNT_JSON_B64`.
3. Create a sheet with tab `Intakes`, share it (Editor) with the service-account email → `.env` `GOOGLE_SHEET_ID`.
4. `node execution/probe_sheets.mjs` → reads sheet metadata.
Columns appended: submitted_at, submission_id, status, lane, service, format, language, age_group, first_name, last_name, email, phone, country, timezone, eligible_ministers, reasons.

## 3. Resend (notification email)
1. resend.com → API key → `.env` `RESEND_API_KEY`.
2. Verify a sending domain; `.env` `RESEND_FROM`, `TEAM_NOTIFY_EMAIL`.
3. `node execution/probe_resend.mjs` → lists domains (no email sent).

## 4. Cal.com (alternative handoff)
Set `catalog.handoff.provider` to `calcom` and `CALCOM_BOOKING_URL`. Payments: install Cal.com's Stripe app on the event type (no code).

## Network
The container/host must allow: `sheets.googleapis.com`, `oauth2.googleapis.com`, `api.resend.com`, the SimplePractice/Cal.com host.

## Lessons log
_None yet._
