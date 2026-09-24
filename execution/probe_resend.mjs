// Phase L probe: is the Resend key valid and is the sending domain verified? Sends no email.
import { loadEnv } from './lib/env.mjs';

const env = loadEnv();
try {
  const res = await fetch('https://api.resend.com/domains', { headers: { authorization: `Bearer ${env.RESEND_API_KEY}` } });
  const body = await res.json();
  if (!res.ok) throw new Error(`${res.status} ${JSON.stringify(body)}`);
  const fromDomain = (env.RESEND_FROM || '').split('@')[1]?.replace('>', '');
  const domain = body.data.find((d) => d.name === fromDomain);
  if (!domain || domain.status !== 'verified') throw new Error(`sending domain "${fromDomain}" not verified`);
  console.log(`GREEN resend: domain ${fromDomain} verified`);
} catch (e) {
  console.error(`RED resend: ${e.message}`);
  process.exit(1);
}
