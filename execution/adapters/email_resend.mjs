// Live email via Resend. UNVERIFIED until probe_resend passes.
import { render } from '../lib/templates.mjs';

export function createResendEmail(env) {
  return {
    async send(message) {
      const to = message.to === 'team' ? env.TEAM_NOTIFY_EMAIL : message.email;
      const { subject, html } = render(message);
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
        body: JSON.stringify({ from: env.RESEND_FROM, to: [to], subject, html }),
      });
      if (!res.ok) throw new Error(`resend ${res.status}: ${await res.text()}`);
    },
  };
}
