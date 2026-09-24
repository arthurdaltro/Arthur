// Deterministic validation of a StartSubmission. SOP: architecture/intake_routing.md
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^[0-9+()\-. ]{7,25}$/;
const COUNTRY = /^[A-Z]{2}$/;

function isTimezone(tz) {
  if (typeof tz !== 'string' || !tz) return false;
  try {
    new Intl.DateTimeFormat('en', { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

function name(errors, field, value) {
  const v = typeof value === 'string' ? value.trim() : '';
  if (!v) errors.push({ field, code: 'required' });
  else if (v.length > 80) errors.push({ field, code: 'too_long' });
}

export function validate(sub, catalog) {
  const errors = [];
  if (!sub || typeof sub !== 'object') return [{ field: '_', code: 'required' }];
  if (typeof sub.crisis_flag !== 'boolean') errors.push({ field: 'crisis_flag', code: 'required' });
  if (sub.crisis_flag === true) return errors;

  const enumCheck = (field, value, allowed) => {
    if (!allowed.includes(value)) errors.push({ field, code: 'invalid_enum' });
  };
  enumCheck('service', sub.service, Object.keys(catalog.services));
  enumCheck('format', sub.format, ['in_person', 'virtual']);
  enumCheck('language', sub.language, Object.keys(catalog.languages));
  enumCheck('age_group', sub.age_group, ['adult', 'minor']);
  enumCheck('discount_group', sub.discount_group, Object.keys(catalog.discount_groups));
  enumCheck('ui_locale', sub.ui_locale, ['en', 'es']);
  if (sub.preferred_minister != null) {
    enumCheck('preferred_minister', sub.preferred_minister, Object.keys(catalog.ministers));
  }

  const c = sub.contact || {};
  name(errors, 'contact.first_name', c.first_name);
  name(errors, 'contact.last_name', c.last_name);
  if (typeof c.email !== 'string' || !EMAIL.test(c.email.trim())) {
    errors.push({ field: 'contact.email', code: 'invalid_email' });
  }
  if (c.phone != null && c.phone !== '' && (typeof c.phone !== 'string' || !PHONE.test(c.phone.trim()))) {
    errors.push({ field: 'contact.phone', code: 'invalid_phone' });
  }
  if (typeof c.country !== 'string' || !COUNTRY.test(c.country)) {
    errors.push({ field: 'contact.country', code: 'invalid_country' });
  }
  if (!isTimezone(c.timezone)) errors.push({ field: 'contact.timezone', code: 'invalid_timezone' });

  if (!sub.consents || sub.consents.terms !== true) {
    errors.push({ field: 'consents.terms', code: 'consent_required' });
  }
  return errors;
}
