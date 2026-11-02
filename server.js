// server.js — LifeBridge Hospital-এর লোকাল ওয়েব সার্ভার ও AI চ্যাট ব্যাকএন্ড
// বাংলা: Node.js-এর built-in module ব্যবহার করা হয়েছে; কোনো npm package লাগে না।

'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const https = require('https');

// বাংলা: .env ফাইল থাকলে সেখান থেকেও কী পড়ার স্বয়ংক্রিয় ব্যবস্থা
function loadDotEnvIfExists() {
  try {
    const envPath = path.join(__dirname, '.env');
    if (!fs.existsSync(envPath)) return;
    const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, '');
      if (key && !process.env[key]) process.env[key] = val;
    }
  } catch (e) {}
}
loadDotEnvIfExists();

const PORT = Number(process.env.PORT) || 3000;

const PUBLIC_FILES = new Set([
  'index.html',
  'patients.html',
  'visits.html',
  'lab.html',
  'billing.html',
  'reports.html',
  'chat.html',
  'settings.html',
  'style.css',
  'db.js',
  'sample-data.js',
  'reports.js',
  'chat.js',
  'polish.js'
]);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

const SYSTEM_PROMPT = 'You are a hospital report assistant. Answer only from the report data given. Never invent numbers. If the data does not have the answer, say so. Money is in Taka (Tk). Keep answers short. You cannot change any data; refuse requests to edit or delete.';

let activeApiKey = (process.env.CHATTERMATE_API_KEY || '').trim();
let cachedModelId = '';

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff'
  });
  res.end(body);
}

function readJsonBody(req, maxBytes) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    let finished = false;

    req.on('data', (chunk) => {
      if (finished) return;
      size += chunk.length;
      if (size > maxBytes) {
        finished = true;
        reject(Object.assign(new Error('Request body exceeds 1 MB limit.'), { statusCode: 413 }));
        req.resume();
        return;
      }
      chunks.push(chunk);
    });

    req.on('end', () => {
      if (finished) return;
      try {
        const text = Buffer.concat(chunks).toString('utf8');
        const parsed = JSON.parse(text || '{}');
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
          throw new Error('Request body must be a JSON object.');
        }
        resolve(parsed);
      } catch (error) {
        reject(Object.assign(new Error('Invalid JSON request body.'), { statusCode: 400 }));
      }
    });

    req.on('error', (error) => {
      if (!finished) reject(error);
    });
  });
}

function requestChatterMate(apiKey, method, requestPath, payload) {
  return new Promise((resolve, reject) => {
    const data = payload === undefined ? '' : JSON.stringify(payload);
    const headers = {
      'X-API-Key': apiKey,
      'Accept': method === 'GET' ? 'application/json' : 'text/event-stream, application/json',
      'User-Agent': 'LifeBridge-Hospital/1.0'
    };

    if (method !== 'GET') {
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = Buffer.byteLength(data);
    }

    const req = https.request({
      hostname: 'chattermate.ai',
      port: 443,
      path: requestPath,
      method,
      headers,
      timeout: 60000
    }, (response) => {
      const chunks = [];
      let responseSize = 0;
      const maxResponseBytes = 5 * 1024 * 1024;

      response.on('data', (chunk) => {
        responseSize += chunk.length;
        if (responseSize > maxResponseBytes) {
          response.destroy(new Error('ChatterMate response exceeded the 5 MB limit.'));
          return;
        }
        chunks.push(chunk);
      });

      response.on('end', () => {
        const responseBody = Buffer.concat(chunks).toString('utf8');
        resolve({
          statusCode: response.statusCode || 500,
          headers: response.headers,
          body: responseBody
        });
      });

      response.on('error', reject);
    });

    req.on('timeout', () => req.destroy(new Error('ChatterMate request timed out.')));
    req.on('error', reject);
    if (method !== 'GET') req.write(data);
    req.end();
  });
}

async function getDefaultModelId(apiKey) {
  const response = await requestChatterMate(apiKey, 'GET', '/api/chat/models');
  if (response.statusCode !== 200) {
    console.error(`[ChatterMate] GET /api/chat/models returned HTTP ${response.statusCode}.`);
    if (response.statusCode === 401) throw Object.assign(new Error('API key is not valid (HTTP 401).'), { statusCode: 401 });
    if (response.statusCode === 403) throw Object.assign(new Error('API key is not allowed to use this service (HTTP 403).'), { statusCode: 403 });
    throw Object.assign(new Error(`Could not load ChatterMate models (HTTP ${response.statusCode}).`), { statusCode: response.statusCode });
  }

  let parsed;
  try {
    parsed = JSON.parse(response.body);
  } catch (error) {
    throw new Error('ChatterMate returned invalid JSON for its model list.');
  }

  if (!parsed || typeof parsed.default_model_id !== 'string' || !parsed.default_model_id.trim()) {
    throw new Error('The ChatterMate model response did not include default_model_id.');
  }
  return parsed.default_model_id.trim();
}

function parseModelChunkStream(rawText) {
  const normalized = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const events = normalized.split('\n\n');
  let answer = '';

  for (const eventText of events) {
    const lines = eventText.split('\n');
    let eventName = '';
    const dataLines = [];

    for (const line of lines) {
      if (line.startsWith('event:')) {
        eventName = line.slice(6).trim();
      } else if (line.startsWith('data:')) {
        dataLines.push(line.slice(5).replace(/^ /, ''));
      }
    }

    if (eventName !== 'model_chunk') continue;
    const dataText = dataLines.join('\n');
    if (!dataText) continue;

    try {
      const item = JSON.parse(dataText);
      if (item && typeof item.content === 'string') answer += item.content;
    } catch (error) {}
  }

  return answer.trim();
}

async function askChatterMate(question, data, providedKey) {
  const keyToUse = (typeof providedKey === 'string' && providedKey.trim()) || activeApiKey;
  if (!keyToUse) {
    throw Object.assign(new Error('No API key is connected. Open Settings and connect your ChatterMate API key.'), { statusCode: 400 });
  }

  if (!cachedModelId || keyToUse !== activeApiKey) {
    cachedModelId = await getDefaultModelId(keyToUse);
    activeApiKey = keyToUse;
  }

  const prompt = `Report data: ${JSON.stringify(data)}\nQuestion: ${question}`;
  const response = await requestChatterMate(keyToUse, 'POST', '/api/chat/stream', {
    models: [cachedModelId],
    system_prompt: SYSTEM_PROMPT,
    prompt
  });

  if (response.statusCode !== 200) {
    console.error(`[ChatterMate] POST /api/chat/stream returned HTTP ${response.statusCode}.`);
    if (response.statusCode === 401) throw Object.assign(new Error('ChatterMate rejected the API key (HTTP 401). Check the key in Settings.'), { statusCode: 401 });
    if (response.statusCode === 403) throw Object.assign(new Error('ChatterMate denied access (HTTP 403). Check the key permissions or account access.'), { statusCode: 403 });
    throw Object.assign(new Error(`ChatterMate request failed (HTTP ${response.statusCode}).`), { statusCode: response.statusCode });
  }

  const answer = parseModelChunkStream(response.body);
  if (!answer) throw new Error('ChatterMate returned no answer text.');
  return answer;
}

async function handleConnect(req, res) {
  try {
    const body = await readJsonBody(req, 1024 * 1024);
    const candidateKey = typeof body.apiKey === 'string' ? body.apiKey.trim() : '';
    if (!candidateKey) return sendJson(res, 400, { error: 'Enter your ChatterMate API key.' });

    const modelId = await getDefaultModelId(candidateKey);
    activeApiKey = candidateKey;
    cachedModelId = modelId;
    console.log('[Settings] ChatterMate key validated and stored in server memory.');
    return sendJson(res, 200, { connected: true, message: 'Connected successfully. The key is stored in server memory only.' });
  } catch (error) {
    const statusCode = error.statusCode || 502;
    console.error(`[Settings] Connect failed (HTTP ${statusCode}): ${error.message}`);
    return sendJson(res, statusCode, { error: error.message || 'Could not connect to ChatterMate.' });
  }
}

function handleStatus(res) {
  return sendJson(res, 200, { connected: Boolean(activeApiKey), keyConfigured: Boolean(activeApiKey), canConnect: true, host: 'local' });
}

function handleDisconnect(res) {
  activeApiKey = '';
  cachedModelId = '';
  console.log('[Settings] ChatterMate key cleared from server memory.');
  return sendJson(res, 200, { connected: false, message: 'Disconnected. The server cleared the key from memory.' });
}

function serveStaticFile(req, res, pathname) {
  let decodedPath;
  try {
    decodedPath = decodeURIComponent(pathname);
  } catch (error) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('400 Bad Request');
    return;
  }

  let fileName = decodedPath === '/' ? 'index.html' : decodedPath.replace(/^\/+/, '');
  if (fileName.includes('/') || fileName.includes('\\') || fileName === '.' || fileName === '..') {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('403 Forbidden');
    return;
  }

  if (!PUBLIC_FILES.has(fileName)) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 Not Found');
    return;
  }

  const fullPath = path.join(__dirname, fileName);
  fs.readFile(fullPath, (error, fileData) => {
    if (error) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found: ' + fileName);
      return;
    }

    const contentType = MIME_TYPES[path.extname(fullPath).toLowerCase()] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': contentType,
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'no-cache'
    });
    res.end(fileData);
  });
}

const server = http.createServer(async (req, res) => {
  let parsedUrl;
  try {
    parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  } catch (error) {
    return sendJson(res, 400, { error: 'Invalid request URL.' });
  }

  const route = parsedUrl.pathname.replace(/\/+$/, '') || '/';
  console.log(`[HTTP] ${req.method} ${route}`);

  if (req.method === 'GET' && route === '/api/settings/status') {
    return handleStatus(res);
  }

  if (req.method === 'GET' && route === '/api/status') {
    return sendJson(res, 200, { keyConfigured: Boolean(activeApiKey), connected: Boolean(activeApiKey), canConnect: true, host: 'local' });
  }

  if (req.method === 'POST' && route === '/api/settings/connect') {
    return handleConnect(req, res);
  }

  if (req.method === 'POST' && route === '/api/connect') {
    return handleConnect(req, res);
  }

  if (req.method === 'POST' && route === '/api/settings/disconnect') {
    return handleDisconnect(res);
  }

  if (req.method === 'POST' && (route === '/ask' || route === '/api/ask')) {
    try {
      const body = await readJsonBody(req, 1024 * 1024);
      const question = typeof body.question === 'string' ? body.question.trim() : '';
      const data = body.data && typeof body.data === 'object' ? body.data : {};
      if (!question) return sendJson(res, 400, { error: 'Question cannot be empty.' });

      const apiKey = typeof body.apiKey === 'string' ? body.apiKey : '';
      const answer = await askChatterMate(question, data, apiKey);
      return sendJson(res, 200, { answer });
    } catch (error) {
      const statusCode = error.statusCode || 502;
      console.error(`[POST /ask] HTTP ${statusCode}: ${error.message}`);
      return sendJson(res, statusCode, { error: error.message || 'Could not get an answer from ChatterMate.' });
    }
  }

  if (req.method === 'GET' && !route.startsWith('/api/')) {
    return serveStaticFile(req, res, route);
  }

  if (route.startsWith('/api/')) {
    return sendJson(res, 404, { error: 'API endpoint not found.' });
  }
  res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Method Not Allowed');
});

const HOST = process.env.HOST || '127.0.0.1';
server.listen(PORT, HOST, () => {
  console.log('Running at http://localhost:' + PORT);
});



