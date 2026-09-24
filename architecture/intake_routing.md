# SOP — Intake Validation & Routing

**Goal:** turn a `StartSubmission` into a `RoutedIntake` deterministically (same input + same catalog ⇒ same output).
**Tools:** `execution/lib/validate.mjs`, `execution/lib/route.mjs`. **Data:** `config/catalog.json`.

## Pipeline (Navigation order)
1. `validate(submission, catalog)` → `errors[]`
2. `route(submission, catalog, errors)` → `RoutedIntake`
3. If status ∉ {`crisis_redirect`, `rejected_invalid`}: `storage.save(intake)`, `email.send(n)` for each notification.

## Validation rules
| Field | Rule | Error code |
|---|---|---|
| `crisis_flag` | boolean | `required` |
| `service` | key in `catalog.services` | `invalid_enum` |
| `format` | `in_person` \| `virtual` | `invalid_enum` |
| `language` | key in `catalog.languages` | `invalid_enum` |
| `preferred_minister` | null or id in `catalog.ministers` | `invalid_enum` |
| `age_group` | `adult` \| `minor` | `invalid_enum` |
| `discount_group` | key in `catalog.discount_groups` | `invalid_enum` |
| `contact.first_name/last_name` | trimmed 1–80 chars | `required` / `too_long` |
| `contact.email` | `^[^\s@]+@[^\s@]+\.[^\s@]+$` | `invalid_email` |
| `contact.phone` | null or 7–25 chars of `[0-9+()\-. ]` | `invalid_phone` |
| `contact.country` | `^[A-Z]{2}$` | `invalid_country` |
| `contact.timezone` | accepted by `Intl.DateTimeFormat` | `invalid_timezone` |
| `consents.terms` | must be `true` | `consent_required` |
| `ui_locale` | `en` \| `es` | `invalid_enum` |

If `crisis_flag === true`, all other fields are ignored (the UI stops before collecting them).

## Routing decision table (first match wins)
| # | Condition | status | next_step | reason |
|---|---|---|---|---|
| 1 | `crisis_flag` | `crisis_redirect` | `crisis_resources` | `crisis` |
| 2 | `errors.length > 0` | `rejected_invalid` | `fix_errors` | `invalid_input` |
| 3 | language ∉ `service.languages` | `needs_review` | `await_match` | `language_not_published_for_service` |
| 4 | format ∉ `service.formats` (or formats null) | `needs_review` | `await_match` | `format_not_published_for_service` |
| 5 | `age_group = minor` | `manual_match` | `await_match` | `minor_requires_guardian` |
| 6 | `!service.fast_track` | `manual_match` | `await_match` | `service_requires_manual_match` |
| 7 | eligible ministers = ∅ | `manual_match` | `await_match` | `no_published_minister_match` |
| 8 | preferred set ∧ preferred ∉ eligible | `manual_match` | `await_match` | `preferred_minister_not_eligible` |
| 9 | otherwise | `fast_track` | `book_now` | `eligible` |

**Eligible minister:** `m.services ∋ service ∧ m.languages ∋ language ∧ m.formats ∋ format`. Any `null` attribute ⇒ not eligible (never guessed). If preferred minister is eligible, `eligible_ministers = [preferred]`.

## Derived fields
- `lane`: `addiction` if service = addiction, else `sessions` (null for crisis/invalid).
- `price_usd`, `duration_min`: from catalog service (may be `null` = not published).
- `discount_note`: `catalog.discount_groups[g].note` when g ≠ `none`.
- `handoff_url`: fast track only → `catalog.handoff.booking_url` (env `SIMPLEPRACTICE_BOOKING_URL` overrides).
- `sla_business_days`: `catalog.sla_business_days` for manual/needs_review; `0` for fast track; `null` otherwise.
- `notifications`:
  - fast_track → client `booking_link`
  - manual_match / needs_review → client `received`, team `new_intake`
  - crisis / invalid → none

## Edge cases
- Catalog missing a service referenced by a minister → minister ignored for that service.
- Unknown extra fields → ignored, never stored.
- Crisis submissions are never stored (rule 3).

## Lessons log (self-annealing)
_None yet._
