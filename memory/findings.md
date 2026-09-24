# Findings — Deep Dive: betheltransformationcenter.com/start

> Research date: 2026-09-24
> **Method constraint:** direct fetch of `www.betheltransformationcenter.com` (and `www.bethel.com`) is **blocked by this container's egress policy** (`connect_rejected`). Everything below comes from search-engine indexes (page titles, meta descriptions, snippets). Anything marked `UNVERIFIED` must be confirmed against the live page before it drives logic.

## 1. Organization

| Field | Finding |
|---|---|
| Name | Bethel Transformation Center (a ministry of Bethel Church) |
| Location | Redding, Shasta County, CA (in-person) + virtual worldwide |
| Positioning | "Birthplace of the international Sozo ministry"; healing of the whole person — soul, body, spirit |
| SEO title (home) | "Christian Therapist \| Counseling, Sozo: Inner-Healing & Deliverance Center \| Faith-Based Healing & Freedom in Shasta County CA" |
| Platform hints | Mixed: some page titles use `— Transformation Center` (Squarespace-style separator: `/ecourse`, `/client-referral-request`), others `- Bethel Transformation Center`. Courses live on a subdomain `courses.betheltransformationcenter.com` (course-platform style URLs `/courses/<slug>`). `UNVERIFIED` which builder. |

## 2. Site map (indexed URLs)

| URL | Title / purpose |
|---|---|
| `/` | Home |
| `/start` | **"Interest Form \| Start Here"** — the entry point of the client funnel |
| `/book` | "Book Appointment" — overlaps with `/start` (two entry points for the same funnel) |
| `/sozo` | Sozo inner-healing & deliverance |
| `/counseling` | Counseling |
| `/addiction-services` | Addiction program (separate funnel: "Book Consultation") |
| `/faq` | FAQs |
| `/team` | Our Team — ministers grouped by category, e.g. `/ministers/category/Counselor` (collection-style CMS) |
| `/contact` | Contact Us |
| `/internship` | Sozo Internship |
| `/ecourse` | E-Courses (links out to courses subdomain) |
| `/client-referral-request` | Client referral (for referrers/therapists) |
| `courses.…/courses/overcome-chaos` | Example e-course |

## 3. Services catalog

- Sozo (inner healing & deliverance) — incl. **Art Sozo** (2.5 h, $150)
- Deliverance (virtual or in-person)
- Counseling
- EMDR
- Brainspotting
- Trauma therapy services
- Coaching
- Addiction services (own consultation flow)
- E-courses (self-paced)
- Sozo Internship (training, not a client service)

## 4. Pricing (as indexed — `UNVERIFIED` currency of data)

- Most sessions: **$115**
- Art Sozo: **$150** / 2.5 hours
- Addiction consultation: **$30** / 30 min, **auto-charged at appointment time**
- Discounts for current Bethel staff & students

## 5. Languages

- Sozo: English, Spanish, Turkish, Mandarin/Taiwanese, Danish (another snippet lists Chinese & Taiwanese separately)
- Counseling: English, Spanish, Mandarin/Taiwanese, Danish
- ⚠ Inconsistency between pages on the language list → single source of truth needed.

## 6. The current `/start` funnel (as-is)

```
[Interest form: contact info]
        │  (email with link)
        ▼
[Intake paperwork]  ← client must complete; team processes in 1–3 business days
        │  staff "prayerfully match" client ↔ minister (client may request a specific team member)
        ▼
[Added to minister's caseload]
        │  (email with booking link)
        ▼
[Client books appointment]
```

Addiction services run a **parallel** funnel: Book Consultation → intake emailed → schedule 30-min $30 consult.

## 7. Friction / problems identified

1. **Two emails + three forms before a booking.** Client leaves the site twice (interest form → email → intake → email → booking). Each hand-off is a drop-off point.
2. **No service selection at entry.** `/start` collects contact info only; the matching is manual. The user doesn't learn price/format/language fit until later.
3. **Duplicate entry points** (`/start`, `/book`, addiction "Book Consultation") with different processes → confusion over "which button do I press".
4. **Pricing and languages scattered** across FAQ, service pages and snippets, with contradictions.
5. **Manual matching is a black box** — "1–3 business days" with no status visibility for the client.
6. **Mixed audiences on one site**: clients, referrers (therapists), interns, course buyers — `/start` should serve clients only and route the rest.
7. **Crisis safety**: a mental-health/deliverance intake page should surface crisis resources (e.g. 988 in US) up front. `UNVERIFIED` whether the current page does.
8. Inconsistent branding in page titles ("— Transformation Center" vs "- Bethel Transformation Center").

## 8. Restructure opportunities (to be validated in Blueprint)

- Single **Start** flow: service picker → fit questions (format, language, budget/discount, preferred minister) → contact → consent → confirmation with clear next steps & timeline.
- Deterministic **routing rules** (service + language + format → eligible minister pool) replacing the free-form "prayerful match" *as a pre-filter* — final match stays human.
- Status transparency: confirmation email with expected SLA.
- One pricing/language table (single source of truth) reused by every page.
- Separate lanes: "I want a session" / "I'm referring someone" / "Training & courses".

## 8b. Team (partial, from search snippets — `UNVERIFIED`)
- Names surfaced: Ari Isaoglu, Chrystal Rodriguez, Cyndi Barber (Sozo minister & pastoral counselor, 20+ yrs).
- Full roster + per-minister languages/services require live access to `/team` (egress-blocked).

## 9. Sources
- https://www.betheltransformationcenter.com/ministers/category/Counselor
- https://www.linkedin.com/in/tcbethel/
- https://www.betheltransformationcenter.com/start
- https://www.betheltransformationcenter.com/
- https://www.betheltransformationcenter.com/book
- https://www.betheltransformationcenter.com/faq
- https://www.betheltransformationcenter.com/sozo
- https://www.betheltransformationcenter.com/counseling
- https://www.betheltransformationcenter.com/addiction-services
- https://www.betheltransformationcenter.com/team
- https://www.betheltransformationcenter.com/contact
- https://www.betheltransformationcenter.com/internship
- https://www.betheltransformationcenter.com/ecourse
- https://www.betheltransformationcenter.com/client-referral-request
- https://courses.betheltransformationcenter.com/courses/overcome-chaos
- https://www.bethel.com/ministries/transformation-center
- https://www.facebook.com/bethel.tc2/
