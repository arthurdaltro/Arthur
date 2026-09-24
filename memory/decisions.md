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
