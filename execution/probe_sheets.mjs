// Phase L probe: can we authenticate and read the target Google Sheet? Usage: node execution/probe_sheets.mjs
import { loadEnv } from './lib/env.mjs';
import { googleAccessToken } from './adapters/google_auth.mjs';

const env = loadEnv();
try {
  const token = await googleAccessToken(env, 'https://www.googleapis.com/auth/spreadsheets.readonly');
  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${env.GOOGLE_SHEET_ID}?fields=properties.title,sheets.properties.title`, {
    headers: { authorization: `Bearer ${token}` },
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`${res.status} ${JSON.stringify(body)}`);
  const tabs = body.sheets.map((s) => s.properties.title);
  if (!tabs.includes('Intakes')) throw new Error(`tab "Intakes" missing (found: ${tabs.join(', ')})`);
  console.log(`GREEN sheets: "${body.properties.title}" tabs=${tabs.join(',')}`);
} catch (e) {
  console.error(`RED sheets: ${e.message}`);
  process.exit(1);
}
