# Task Plan — Bethel Transformation Center `/start` Restructure

**Status:** 🟢 Blueprint approved — building Phase A/S.

## Protocol 0 — Initialization
- [x] Create `/memory/` (task_plan, findings, progress, decisions)
- [x] Create `CLAUDE.md` constitution
- [x] Create `/architecture/`, `/execution/`, `/.tmp/`, `.env.example`
- [x] Deep-dive research logged in `findings.md`

## Phase B — Blueprint
- [x] Q1 North Star (portfolio + sales pitch; integration-ready prototype)
- [x] Q2 Integrations (providers chosen; live connection deferred → handoff-ready, D-006)
- [x] Q3 Source of Truth (Sheets for intakes; config/catalog.json for catalog; real names, D-007)
- [x] Q4 Delivery Payload (A+B+C+D; hybrid fast-track/manual flow, D-008)
- [x] Q5 Behavioral Rules (all 8 accepted)
- [x] Input/Output JSON schema confirmed
- [x] Blueprint approved by user (2026-09-24)

## Phase L — Link
- [ ] Probe script per integration in `/execution/probe_*.py` (written, not run — D-006)
- [ ] ~~All links green~~ → deferred to integrator; mock adapters green
- [ ] Obtain live access to the site (egress allowlist) to verify `UNVERIFIED` findings

## Phase A — Architect
- [ ] SOP: `architecture/intake_routing.md`
- [ ] SOP: `architecture/start_page_content.md`
- [ ] Tools: validate_submission, route_submission, deliver_payload
- [ ] Unit tests per tool

## Phase S — Stylize
- [ ] Restructured `/start` page (mobile-first, accessible, i18n-ready)
- [ ] Email/notification templates
- [ ] Screenshots + verify command
- [ ] User sign-off

## Phase T — Trigger
- [ ] Deploy target decided
- [ ] Trigger (form webhook) documented in `CLAUDE.md`
- [ ] Maintenance log finalized
