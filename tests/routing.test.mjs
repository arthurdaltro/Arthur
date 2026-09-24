import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { validate } from '../execution/lib/validate.mjs';
import { route, eligibleMinisters } from '../execution/lib/route.mjs';
import { processSubmission, sanitize } from '../execution/lib/intake.mjs';
import { createAdapters } from '../execution/adapters/index.mjs';

const catalog = JSON.parse(readFileSync(new URL('../config/catalog.json', import.meta.url), 'utf8'));

const base = () => ({
  crisis_flag: false,
  service: 'sozo',
  format: 'virtual',
  language: 'en',
  preferred_minister: null,
  age_group: 'adult',
  discount_group: 'none',
  contact: {
    first_name: 'Ana',
    last_name: 'Silva',
    email: 'ana@example.com',
    phone: null,
    country: 'BR',
    timezone: 'America/Sao_Paulo',
  },
  consents: { terms: true, communications: false },
  ui_locale: 'en',
});

const run = (sub) => route(sub, catalog, validate(sub, catalog));

test('valid adult Sozo in English, virtual → fast track to booking', () => {
  const r = run(base());
  assert.equal(r.status, 'fast_track');
  assert.equal(r.next_step, 'book_now');
  assert.deepEqual(r.eligible_ministers, ['demo_placeholder']);
  assert.equal(r.price_usd, 115);
  assert.equal(r.handoff_url, catalog.handoff.booking_url);
  assert.equal(r.sla_business_days, 0);
  assert.deepEqual(r.notifications.map((n) => n.template), ['booking_link']);
});

test('crisis flag short-circuits, ignores other fields, no notifications', () => {
  const r = run({ crisis_flag: true });
  assert.equal(r.status, 'crisis_redirect');
  assert.equal(r.next_step, 'crisis_resources');
  assert.deepEqual(r.notifications, []);
  assert.equal(r.lane, null);
});

test('invalid input → rejected_invalid with field errors', () => {
  const sub = base();
  sub.contact.email = 'nope';
  sub.consents.terms = false;
  sub.contact.timezone = 'Mars/Olympus';
  const r = run(sub);
  assert.equal(r.status, 'rejected_invalid');
  assert.deepEqual(r.errors.map((e) => e.field).sort(), ['consents.terms', 'contact.email', 'contact.timezone']);
});

test('service not fast-trackable → manual match with SLA', () => {
  const r = run({ ...base(), service: 'emdr' });
  assert.equal(r.status, 'manual_match');
  assert.deepEqual(r.reasons, ['service_requires_manual_match']);
  assert.equal(r.sla_business_days, 3);
  assert.deepEqual(r.notifications.map((n) => n.to), ['client', 'team']);
});

test('minor → manual match even for fast-trackable service', () => {
  const r = run({ ...base(), age_group: 'minor' });
  assert.equal(r.status, 'manual_match');
  assert.deepEqual(r.reasons, ['minor_requires_guardian']);
});

test('language not published for the service → needs_review', () => {
  const r = run({ ...base(), service: 'coaching', language: 'tr' });
  assert.equal(r.status, 'needs_review');
  assert.deepEqual(r.reasons, ['language_not_published_for_service']);
});

test('unpublished formats (null) → needs_review, never guessed', () => {
  const r = run({ ...base(), service: 'art_sozo' });
  assert.equal(r.status, 'needs_review');
  assert.deepEqual(r.reasons, ['format_not_published_for_service']);
});

test('fast-trackable service but no minister with published match → manual', () => {
  const r = run({ ...base(), language: 'da' });
  assert.equal(r.status, 'manual_match');
  assert.deepEqual(r.reasons, ['no_published_minister_match']);
});

test('preferred minister with unpublished attributes → manual (conflict)', () => {
  const r = run({ ...base(), preferred_minister: 'cyndi_barber' });
  assert.equal(r.status, 'manual_match');
  assert.deepEqual(r.reasons, ['preferred_minister_not_eligible']);
});

test('preferred minister who is eligible → fast track to that minister only', () => {
  const r = run({ ...base(), preferred_minister: 'demo_placeholder' });
  assert.equal(r.status, 'fast_track');
  assert.deepEqual(r.eligible_ministers, ['demo_placeholder']);
});

test('real ministers are never eligible while attributes are null', () => {
  for (const s of Object.keys(catalog.services)) {
    for (const l of Object.keys(catalog.languages)) {
      for (const f of ['in_person', 'virtual']) {
        assert.ok(eligibleMinisters(catalog, s, l, f).every((id) => catalog.ministers[id].demo));
      }
    }
  }
});

test('discount note comes from catalog', () => {
  const r = run({ ...base(), discount_group: 'bethel_student' });
  assert.equal(r.discount_note, catalog.discount_groups.bethel_student.note);
});

test('env booking URL overrides catalog placeholder', () => {
  const sub = base();
  const r = route(sub, catalog, validate(sub, catalog), {}, { SIMPLEPRACTICE_BOOKING_URL: 'https://x.clientsecure.me' });
  assert.equal(r.handoff_url, 'https://x.clientsecure.me');
});

test('routing is deterministic', () => {
  assert.deepEqual(run(base()), run(base()));
});

test('sanitize drops unknown fields', () => {
  const s = sanitize({ ...base(), diagnosis: 'x', contact: { ...base().contact, ssn: '1' } });
  assert.equal('diagnosis' in s, false);
  assert.equal('ssn' in s.contact, false);
});

test('end-to-end mock: manual intake stored + client and team emails in outbox; crisis stores nothing', async () => {
  const root = mkdtempSync(join(tmpdir(), 'btc-'));
  const adapters = createAdapters({ ADAPTER_MODE: 'mock' }, root);
  const ctx = { catalog, adapters, now: () => new Date('2026-09-24T12:00:00Z') };

  const manual = await processSubmission({ ...base(), service: 'counseling', language: 'zh-TW' }, ctx);
  assert.equal(manual.status, 'manual_match');
  assert.equal(readdirSync(join(root, '.tmp', 'intakes')).length, 1);
  assert.equal(readdirSync(join(root, '.tmp', 'outbox')).length, 2);

  const crisis = await processSubmission({ crisis_flag: true, contact: { email: 'a@b.co' } }, ctx);
  assert.equal(crisis.status, 'crisis_redirect');
  assert.equal(readdirSync(join(root, '.tmp', 'intakes')).length, 1);
  assert.equal((await adapters.storage.list())[0].intake.submission_id, manual.submission_id);
});

test('live mode refuses to start without credentials', () => {
  assert.throws(() => createAdapters({ ADAPTER_MODE: 'live' }, '/tmp'), /missing \.env keys/);
});
