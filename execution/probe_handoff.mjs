// Phase L probe: does the booking handoff URL (SimplePractice / Cal.com) respond?
import { readFile } from 'node:fs/promises';
import { loadEnv, ROOT } from './lib/env.mjs';

const env = loadEnv();
const catalog = JSON.parse(await readFile(new URL('../config/catalog.json', import.meta.url), 'utf8'));
const url = env.SIMPLEPRACTICE_BOOKING_URL || catalog.handoff.booking_url;
try {
  if (!env.SIMPLEPRACTICE_BOOKING_URL && catalog.handoff.booking_url_is_placeholder) {
    throw new Error(`still using placeholder ${url}; set SIMPLEPRACTICE_BOOKING_URL in ${ROOT}/.env`);
  }
  const res = await fetch(url, { redirect: 'manual' });
  if (res.status >= 400) throw new Error(`${url} → HTTP ${res.status}`);
  console.log(`GREEN handoff: ${url} → HTTP ${res.status}`);
} catch (e) {
  console.error(`RED handoff: ${e.message}`);
  process.exit(1);
}
