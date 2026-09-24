// Adapter selection by ADAPTER_MODE (mock | live). SOP: architecture/integrations.md
import { createMockStorage } from './storage_mock.mjs';
import { createMockEmail } from './email_mock.mjs';
import { createSheetsStorage } from './storage_sheets.mjs';
import { createResendEmail } from './email_resend.mjs';

const REQUIRED_LIVE = ['GOOGLE_SERVICE_ACCOUNT_JSON_B64', 'GOOGLE_SHEET_ID', 'RESEND_API_KEY', 'RESEND_FROM', 'TEAM_NOTIFY_EMAIL'];

export function createAdapters(env, root) {
  const mode = env.ADAPTER_MODE || 'mock';
  if (mode === 'mock') return { mode, storage: createMockStorage(root), email: createMockEmail(root) };
  if (mode !== 'live') throw new Error(`ADAPTER_MODE must be mock|live, got "${mode}"`);
  const missing = REQUIRED_LIVE.filter((k) => !env[k]);
  if (missing.length) throw new Error(`ADAPTER_MODE=live missing .env keys: ${missing.join(', ')}`);
  return { mode, storage: createSheetsStorage(env), email: createResendEmail(env) };
}
