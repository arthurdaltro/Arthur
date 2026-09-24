# SOP — `/start` Page Flow & Content

**Goal:** one form, < 3 minutes, from first click to a routed intake. Copy in `web/i18n.js` (EN, ES). All prices/languages/services rendered from `/api/catalog` — never hard-coded.

## Steps (single page, progressive)
0. **Banner:** "Concept prototype — not affiliated with or endorsed by Bethel" + "Not a HIPAA system" (always visible).
1. **Safety check (gate):** "Are you in immediate danger or thinking about harming yourself?" Yes → crisis screen (988 call/text, 988lifeline.org/chat, 911, international: findahelpline.com). Nothing else shown or stored. No → continue.
2. **Who is this for?** "I'm looking for a session for myself/my family" (continue) · "I'm referring a client" → `/client-referral-request` · "Training & courses" → `/internship`, `/ecourse`.
3. **Service:** cards from catalog with short plain description, price (or "price confirmed at intake"), duration if published, "book right away" badge when fast-trackable.
4. **Fit:** format (in person Redding / virtual), language (only languages published for the service; others visible with "our team will review"), age group, discount group, preferred minister (optional; eligible first).
5. **Contact + consent:** name, email, phone (optional), country, timezone (auto-detected), terms consent (required), updates consent (optional).
6. **Result screen** by status:
   - `fast_track`: "You can book now" + price + minister + button to booking (SimplePractice).
   - `manual_match` / `needs_review`: "We received your request" + what happens next + SLA "within 3 business days" + reason in plain words.
   - `rejected_invalid`: inline field errors.

## Tone rules
Warm, Christian, plain. No urgency, no pressure, no healing promises, no diagnosis language.

## Accessibility
Labels on every input, focus-visible, keyboard navigation, 4.5:1 contrast, `prefers-reduced-motion` respected, mobile-first (≥ 320px).
