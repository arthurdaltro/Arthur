// Email templates (plain, warm, no pressure). Rendered for live email and previewed in mock outbox.
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

const COPY = {
  booking_link: (m) => ({
    subject: 'Your next step: choose a time',
    body: `<p>Hi ${esc(m.first_name)},</p><p>Thank you for reaching out. You can choose a time that works for you here:</p>
<p><a href="${esc(m.handoff_url)}">Book your ${esc(m.service_label)} session</a></p>
<p>Price: ${m.price_usd != null ? `$${m.price_usd}` : 'confirmed at intake'}. We are glad you're here.</p>`,
  }),
  received: (m) => ({
    subject: 'We received your request',
    body: `<p>Hi ${esc(m.first_name)},</p><p>Thank you for reaching out. Our team will prayerfully match you with a minister and
email you within ${m.sla_business_days} business days with your next step.</p><p>If you are ever in crisis in the U.S., call or text 988.</p>`,
  }),
  new_intake: (m) => ({
    subject: `New intake: ${m.service_label} (${m.status})`,
    body: `<p>New ${esc(m.status)} intake ${esc(m.submission_id)} — ${esc(m.service_label)}, reasons: ${esc(m.reasons.join(', '))}.</p>
<p>Open the dashboard to review.</p>`,
  }),
};

export function render(message) {
  const { subject, body } = COPY[message.template](message);
  return { subject, html: `<div style="font-family:Georgia,serif;font-size:16px;line-height:1.5;color:#2b2622">${body}</div>` };
}
