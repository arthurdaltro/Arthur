// Deterministic routing: StartSubmission -> RoutedIntake. SOP: architecture/intake_routing.md
const has = (list, value) => Array.isArray(list) && list.includes(value);

export function eligibleMinisters(catalog, service, language, format) {
  return Object.entries(catalog.ministers)
    .filter(([, m]) => has(m.services, service) && has(m.languages, language) && has(m.formats, format))
    .map(([id]) => id)
    .sort();
}

function decide(sub, catalog, errors) {
  if (sub.crisis_flag === true) return ['crisis_redirect', 'crisis', []];
  if (errors.length > 0) return ['rejected_invalid', 'invalid_input', []];

  const svc = catalog.services[sub.service];
  if (!has(svc.languages, sub.language)) return ['needs_review', 'language_not_published_for_service', []];
  if (!has(svc.formats, sub.format)) return ['needs_review', 'format_not_published_for_service', []];
  if (sub.age_group === 'minor') return ['manual_match', 'minor_requires_guardian', []];
  if (!svc.fast_track) return ['manual_match', 'service_requires_manual_match', []];

  const eligible = eligibleMinisters(catalog, sub.service, sub.language, sub.format);
  if (eligible.length === 0) return ['manual_match', 'no_published_minister_match', []];
  if (sub.preferred_minister != null) {
    if (!eligible.includes(sub.preferred_minister)) {
      return ['manual_match', 'preferred_minister_not_eligible', eligible];
    }
    return ['fast_track', 'eligible', [sub.preferred_minister]];
  }
  return ['fast_track', 'eligible', eligible];
}

const NEXT_STEP = {
  crisis_redirect: 'crisis_resources',
  rejected_invalid: 'fix_errors',
  needs_review: 'await_match',
  manual_match: 'await_match',
  fast_track: 'book_now',
};

const NOTIFICATIONS = {
  fast_track: [{ channel: 'email', to: 'client', template: 'booking_link' }],
  manual_match: [
    { channel: 'email', to: 'client', template: 'received' },
    { channel: 'email', to: 'team', template: 'new_intake' },
  ],
  needs_review: [
    { channel: 'email', to: 'client', template: 'received' },
    { channel: 'email', to: 'team', template: 'new_intake' },
  ],
};

export function route(sub, catalog, errors, meta = {}, env = {}) {
  const [status, reason, eligible] = decide(sub, catalog, errors);
  const routed = status !== 'crisis_redirect' && status !== 'rejected_invalid';
  const svc = routed ? catalog.services[sub.service] : null;
  const discount = routed && sub.discount_group !== 'none' ? catalog.discount_groups[sub.discount_group] : null;

  return {
    submission_id: meta.submission_id ?? null,
    submitted_at: meta.submitted_at ?? null,
    status,
    lane: svc ? svc.lane : null,
    reasons: [reason],
    eligible_ministers: eligible,
    price_usd: svc ? svc.price_usd : null,
    duration_min: svc ? svc.duration_min : null,
    discount_note: discount ? discount.note : null,
    next_step: NEXT_STEP[status],
    handoff_url: status === 'fast_track' ? env.SIMPLEPRACTICE_BOOKING_URL || catalog.handoff.booking_url : null,
    sla_business_days: status === 'fast_track' ? 0 : routed ? catalog.sla_business_days : null,
    notifications: NOTIFICATIONS[status] ?? [],
    errors,
  };
}
