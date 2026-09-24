// Navigation layer: calls tools in SOP order (validate -> route -> store -> notify). SOP: architecture/intake_routing.md
import { randomUUID } from 'node:crypto';
import { validate } from './validate.mjs';
import { route } from './route.mjs';

const str = (v) => (typeof v === 'string' ? v.trim() : v ?? null);

// Keep only schema fields; unknown fields are never stored.
export function sanitize(raw) {
  const c = raw?.contact ?? {};
  return {
    crisis_flag: raw?.crisis_flag,
    service: raw?.service,
    format: raw?.format,
    language: raw?.language,
    preferred_minister: raw?.preferred_minister || null,
    age_group: raw?.age_group,
    discount_group: raw?.discount_group,
    contact: {
      first_name: str(c.first_name),
      last_name: str(c.last_name),
      email: str(c.email),
      phone: str(c.phone) || null,
      country: str(c.country),
      timezone: str(c.timezone),
    },
    consents: { terms: raw?.consents?.terms === true, communications: raw?.consents?.communications === true },
    ui_locale: raw?.ui_locale,
  };
}

export async function processSubmission(raw, { catalog, adapters, env = {}, now = () => new Date() }) {
  const submission = sanitize(raw);
  const errors = validate(submission, catalog);
  const meta = { submission_id: randomUUID(), submitted_at: now().toISOString() };
  const intake = route(submission, catalog, errors, meta, env);

  if (intake.status === 'crisis_redirect' || intake.status === 'rejected_invalid') return intake;

  await adapters.storage.save({ intake, submission });
  const service_label = catalog.services[submission.service].label;
  for (const n of intake.notifications) {
    await adapters.email.send({
      ...n,
      email: submission.contact.email,
      first_name: submission.contact.first_name,
      service_label,
      submission_id: intake.submission_id,
      status: intake.status,
      reasons: intake.reasons,
      price_usd: intake.price_usd,
      handoff_url: intake.handoff_url,
      sla_business_days: intake.sla_business_days,
    });
  }
  return intake;
}
