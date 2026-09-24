# Task Plan — Bethel Transformation Center `/start` Restructure

**Status:** 🟡 Phase S built — awaiting sign-off.

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
- [x] SOP: `architecture/intake_routing.md` (+ integrations.md)
- [x] SOP: `architecture/start_page_content.md`
- [x] Tools: validate, route, intake pipeline, adapters, probes
- [x] Unit tests per tool (17) + E2E

## Phase S — Stylize
- [x] Restructured `/start` page (mobile-first, accessible, EN/ES)
- [x] Email/notification templates (execution/lib/templates.mjs)
- [x] Screenshots + verify command (npm run e2e)
- [ ] User sign-off

## Phase T — Trigger
- [ ] Deploy target decided
- [ ] Trigger (form webhook) documented in `CLAUDE.md`
- [ ] Maintenance log finalized
