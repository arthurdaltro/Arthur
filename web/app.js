// /start flow controller. Routing decisions happen server-side (execution/lib/route.mjs); this file only renders.
import { I18N } from './i18n.js';

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];
const STEPS = ['safety', 'who', 'service', 'fit', 'contact'];

const state = { locale: 'en', catalog: null, service: null, lastResult: null };

function t(key, vars = {}) {
  const v = I18N[state.locale][key] ?? I18N.en[key] ?? key;
  return typeof v === 'string' ? v.replace(/\{(\w+)\}/g, (_, k) => vars[k]) : v;
}
const svcText = (id) => I18N[state.locale].services[id] ?? [state.catalog.services[id].label, state.catalog.services[id].summary];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

function applyI18n() {
  document.documentElement.lang = state.locale;
  $$('[data-i18n]').forEach((el) => (el.textContent = t(el.dataset.i18n)));
  $$('[data-locale]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.locale === state.locale)));
  if (state.catalog) {
    renderServices();
    renderFit();
    if (state.lastResult) renderResult(state.lastResult);
  }
  updateStepLabel();
}

let current = 'safety';
function go(step) {
  current = step;
  $$('section[data-step]').forEach((s) => (s.hidden = s.dataset.step !== step));
  const idx = STEPS.indexOf(step);
  $('#progress-wrap').hidden = idx === -1;
  $$('.progress span').forEach((s, i) => s.classList.toggle('on', i <= idx));
  updateStepLabel();
  if (step === 'fit') renderFit();
  $('#main').focus({ preventScroll: true });
  window.scrollTo({ top: 0 });
}
function updateStepLabel() {
  const idx = STEPS.indexOf(current);
  if (idx !== -1) $('#step-label').textContent = t('step', { n: idx + 1 });
}

function priceText(svc) {
  const parts = [svc.price_usd != null ? `$${svc.price_usd}` : t('price_confirm')];
  if (svc.duration_min) parts.push(t('minutes', { n: svc.duration_min }));
  return parts.join(' · ');
}

function renderServices() {
  const box = $('#services');
  box.innerHTML = Object.entries(state.catalog.services)
    .map(([id, svc]) => {
      const [label, summary] = svcText(id);
      return `<button type="button" class="option" role="radio" aria-checked="${state.service === id}" aria-pressed="${state.service === id}" data-service="${id}">
        <strong>${esc(label)}</strong><span class="desc">${esc(summary)}</span>
        <span class="meta"><span>${esc(priceText(svc))}</span>
        <span class="badge ${svc.fast_track ? 'fast' : 'manual'}">${t(svc.fast_track ? 'badge_fast' : 'badge_manual')}</span></span>
      </button>`;
    })
    .join('');
  $('#service-next').disabled = !state.service;
}

function renderFit() {
  if (!state.service) return;
  const svc = state.catalog.services[state.service];
  $('#fit-summary').innerHTML = `${t('summary')}: <strong>${esc(svcText(state.service)[0])}</strong> · ${esc(priceText(svc))}`;

  const langSel = $('#language');
  const prevLang = langSel.value;
  langSel.innerHTML = Object.entries(state.catalog.languages)
    .map(([code, name]) => {
      const published = svc.languages?.includes(code);
      return `<option value="${code}">${esc(name)}${published ? '' : ' ' + t('lang_review')}</option>`;
    })
    .join('');
  langSel.value = prevLang && state.catalog.languages[prevLang] ? prevLang : svc.languages?.includes(state.locale) ? state.locale : 'en';

  const discSel = $('#discount');
  const prevDisc = discSel.value || 'none';
  discSel.innerHTML = Object.keys(state.catalog.discount_groups)
    .map((id) => `<option value="${id}">${esc(t('disc_' + id))}</option>`)
    .join('');
  discSel.value = prevDisc;

  const minSel = $('#minister');
  const prevMin = minSel.value;
  minSel.innerHTML =
    `<option value="">${esc(t('minister_any'))}</option>` +
    Object.entries(state.catalog.ministers)
      .map(([id, m]) => `<option value="${id}">${esc(m.name)}</option>`)
      .join('');
  minSel.value = prevMin;
}

function payload() {
  const val = (id) => $(`#${id}`).value.trim();
  return {
    crisis_flag: false,
    service: state.service,
    format: $('input[name=format]:checked').value,
    language: $('#language').value,
    preferred_minister: $('#minister').value || null,
    age_group: $('input[name=age_group]:checked').value,
    discount_group: $('#discount').value,
    contact: {
      first_name: val('first_name'),
      last_name: val('last_name'),
      email: val('email'),
      phone: val('phone') || null,
      country: val('country').toUpperCase(),
      timezone: val('timezone'),
    },
    consents: { terms: $('#terms').checked, communications: $('#comms').checked },
    ui_locale: state.locale,
  };
}

function showErrors(errors) {
  $$('[data-field]').forEach((el) => {
    el.classList.remove('invalid');
    const msg = el.querySelector('.msg');
    if (msg) msg.textContent = '';
  });
  errors.forEach((e) => {
    const el = $(`[data-field="${e.field}"]`);
    if (!el) return;
    el.classList.add('invalid');
    const msg = el.querySelector('.msg');
    if (msg) msg.textContent = t('err')[e.code] ?? e.code;
  });
  $('#form-alert').hidden = errors.length === 0;
  const first = $('.invalid input');
  if (first) first.focus();
}

function renderResult(r) {
  const fast = r.status === 'fast_track';
  const res = $('section[data-step=result]');
  res.classList.toggle('fast', fast);
  res.classList.toggle('manual', !fast);
  $('#r-icon').textContent = fast ? '✓' : '✦';
  $('#r-title').textContent = t(fast ? 'result_fast_title' : 'result_manual_title');
  $('#r-body').textContent = fast ? t('result_fast_body') : t('result_manual_body', { n: r.sla_business_days });

  const facts = [[t('summary'), svcText(state.service)[0]], [t('result_price'), r.price_usd != null ? `$${r.price_usd}` : t('price_confirm')]];
  if (fast) facts.push([t('result_with'), r.eligible_ministers.map((id) => state.catalog.ministers[id].name).join(', ')]);
  if (r.discount_note) facts.push([t('discount_label'), r.discount_note]);
  $('#r-facts').innerHTML = facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('');

  const why = $('#r-why');
  const reason = t('reasons')[r.reasons[0]];
  why.hidden = fast || !reason;
  why.innerHTML = reason ? `<strong>${esc(t('result_why'))}</strong> ${esc(reason)}` : '';

  $('#r-next').innerHTML = t(fast ? 'result_next_fast' : 'result_next_manual').map((s) => `<li>${esc(s)}</li>`).join('');
  const cta = $('#r-cta');
  cta.hidden = !fast;
  if (fast) cta.href = r.handoff_url;
  $('#r-placeholder').hidden = !(fast && state.catalog.handoff.booking_url_is_placeholder);
}

async function submit(ev) {
  ev.preventDefault();
  const btn = $('#submit');
  btn.disabled = true;
  btn.textContent = t('sending');
  try {
    const res = await fetch('/api/submit', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload()),
    });
    const r = await res.json();
    if (r.status === 'rejected_invalid') return showErrors(r.errors);
    showErrors([]);
    state.lastResult = r;
    renderResult(r);
    go('result');
  } finally {
    btn.disabled = false;
    btn.textContent = t('submit');
  }
}

function defaults() {
  $('#timezone').value = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  const region = (navigator.language.split('-')[1] || '').toUpperCase();
  if (/^[A-Z]{2}$/.test(region)) $('#country').value = region;
}

async function init() {
  const saved = (() => {
    try { return localStorage.getItem('locale'); } catch { return null; }
  })();
  state.locale = saved === 'es' || (!saved && navigator.language.startsWith('es')) ? 'es' : 'en';
  state.catalog = await (await fetch('/api/catalog')).json();

  $$('[data-go]').forEach((b) => b.addEventListener('click', () => go(b.dataset.go)));
  $$('[data-locale]').forEach((b) =>
    b.addEventListener('click', () => {
      state.locale = b.dataset.locale;
      try { localStorage.setItem('locale', state.locale); } catch {}
      applyI18n();
    }),
  );
  $('#safe-no').addEventListener('click', () => go('who'));
  $('#safe-yes').addEventListener('click', () => go('crisis'));
  $('#services').addEventListener('click', (e) => {
    const b = e.target.closest('[data-service]');
    if (!b) return;
    state.service = b.dataset.service;
    renderServices();
  });
  $('#service-next').addEventListener('click', () => go('fit'));
  $$('input[name=age_group]').forEach((r) => r.addEventListener('change', () => ($('#minor-note').hidden = r.value !== 'minor' || !r.checked)));
  $('#contact-form').addEventListener('submit', submit);
  $('#restart').addEventListener('click', () => {
    state.service = null;
    state.lastResult = null;
    renderServices();
    go('safety');
  });

  defaults();
  applyI18n();
  go('safety');
}

init();
