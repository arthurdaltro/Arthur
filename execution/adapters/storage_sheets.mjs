// Live storage: appends one row per intake to Google Sheets tab "Intakes". UNVERIFIED until probe_sheets passes.
// ⚠ Demo/alternative only — not for PHI (D-009).
import { googleAccessToken } from './google_auth.mjs';

const SCOPE = 'https://www.googleapis.com/auth/spreadsheets';

export function toRow({ intake, submission }) {
  const c = submission.contact;
  return [
    intake.submitted_at, intake.submission_id, intake.status, intake.lane, submission.service, submission.format,
    submission.language, submission.age_group, c.first_name, c.last_name, c.email, c.phone ?? '', c.country,
    c.timezone, intake.eligible_ministers.join(' '), intake.reasons.join(' '),
  ];
}

export function createSheetsStorage(env) {
  const base = `https://sheets.googleapis.com/v4/spreadsheets/${env.GOOGLE_SHEET_ID}`;
  return {
    async save(record) {
      const token = await googleAccessToken(env, SCOPE);
      const res = await fetch(`${base}/values/Intakes!A1:append?valueInputOption=RAW`, {
        method: 'POST',
        headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
        body: JSON.stringify({ values: [toRow(record)] }),
      });
      if (!res.ok) throw new Error(`sheets append ${res.status}: ${await res.text()}`);
    },
    async list() {
      // The team works in the sheet itself; the dashboard only lists records in mock mode.
      return [];
    },
  };
}
