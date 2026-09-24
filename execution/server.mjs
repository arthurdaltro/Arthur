// Zero-dependency HTTP server: static web/ + JSON API. Usage: npm start
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { loadEnv, ROOT } from './lib/env.mjs';
import { createAdapters } from './adapters/index.mjs';
import { processSubmission } from './lib/intake.mjs';

const env = loadEnv();
const adapters = createAdapters(env, ROOT);
const WEB = join(ROOT, 'web');
const MAX_BODY = 20_000;
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' };

async function loadCatalog() {
  const catalog = JSON.parse(await readFile(join(ROOT, 'config', 'catalog.json'), 'utf8'));
  if (env.SIMPLEPRACTICE_BOOKING_URL) {
    catalog.handoff.booking_url = env.SIMPLEPRACTICE_BOOKING_URL;
    catalog.handoff.booking_url_is_placeholder = false;
  }
  return catalog;
}

function json(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json' });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > MAX_BODY) reject(new Error('body_too_large'));
    });
    req.on('end', () => resolve(data));
  });
}

async function serveStatic(res, pathname) {
  const file = normalize(join(WEB, pathname === '/' ? 'index.html' : pathname));
  if (!file.startsWith(WEB)) return json(res, 404, { error: 'not_found' });
  try {
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream' });
    res.end(body);
  } catch {
    json(res, 404, { error: 'not_found' });
  }
}

const server = createServer(async (req, res) => {
  const { pathname, searchParams } = new URL(req.url, 'http://localhost');
  try {
    if (pathname === '/api/catalog' && req.method === 'GET') return json(res, 200, await loadCatalog());
    if (pathname === '/api/submit' && req.method === 'POST') {
      let raw;
      try {
        raw = JSON.parse(await readBody(req));
      } catch {
        return json(res, 400, { error: 'invalid_json' });
      }
      const intake = await processSubmission(raw, { catalog: await loadCatalog(), adapters, env });
      return json(res, intake.status === 'rejected_invalid' ? 422 : 200, intake);
    }
    if (pathname === '/api/intakes' && req.method === 'GET') {
      if (env.DASHBOARD_TOKEN && searchParams.get('token') !== env.DASHBOARD_TOKEN) {
        return json(res, 401, { error: 'unauthorized' });
      }
      return json(res, 200, { mode: adapters.mode, records: await adapters.storage.list() });
    }
    if (req.method === 'GET') return serveStatic(res, pathname);
    json(res, 405, { error: 'method_not_allowed' });
  } catch (e) {
    console.error(e);
    json(res, 500, { error: 'internal_error' });
  }
});

const port = Number(env.PORT || 3000);
server.listen(port, () => console.log(`/start prototype (${adapters.mode}) → http://localhost:${port}`));
