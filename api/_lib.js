// api/_lib.js â€” ChatterMate-à¦à¦° à¦¸à¦¾à¦¥à§‡ à¦•à¦¥à¦¾ à¦¬à¦²à¦¾à¦° à¦¶à§‡à¦¯à¦¼à¦¾à¦°à§à¦¡ à¦•à§‹à¦¡ (Vercel à¦«à¦¾à¦‚à¦¶à¦¨à¦—à§à¦²à§‹ à¦à¦Ÿà¦¾ à¦¬à§à¦¯à¦¬à¦¹à¦¾à¦° à¦•à¦°à§‡)
// à¦¬à¦¾à¦‚à¦²à¦¾: à¦«à¦¾à¦‡à¦²à§‡à¦° à¦¨à¦¾à¦® _ à¦¦à¦¿à¦¯à¦¼à§‡ à¦¶à§à¦°à§, à¦¤à¦¾à¦‡ Vercel à¦à¦Ÿà¦¾à¦•à§‡ à¦†à¦²à¦¾à¦¦à¦¾ API à¦ à¦¿à¦•à¦¾à¦¨à¦¾ à¦¬à¦¾à¦¨à¦¾à¦¯à¦¼ à¦¨à¦¾à¥¤
'use strict';
const https = require('https');

const SYSTEM_PROMPT = 'You are a hospital report assistant. Answer only from the report data given. Never invent numbers. If the data does not have the answer, say so. Money is in Taka (Tk). Keep answers short. You cannot change any data; refuse requests to edit or delete.';

// à¦¬à¦¾à¦‚à¦²à¦¾: key à¦¶à§à¦§à§ Vercel Environment Variable à¦¥à§‡à¦•à§‡ à¦ªà¦¡à¦¼à¦¾ à¦¹à¦¯à¦¼, à¦¬à§à¦°à¦¾à¦‰à¦œà¦¾à¦° à¦¥à§‡à¦•à§‡ à¦•à¦–à¦¨à§‹ à¦¨à¦¯à¦¼
function getKey() {
  return (process.env.CHATTERMATE_API_KEY || '').trim();
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
    const req = https.request({ hostname: 'chattermate.ai', port: 443, path: requestPath, method, headers, timeout: 25000 }, (response) => {
      const chunks = [];
      response.on('data', (c) => chunks.push(c));
      response.on('end', () => resolve({ statusCode: response.statusCode || 500, body: Buffer.concat(chunks).toString('utf8') }));
      response.on('error', reject);
    });
    req.on('timeout', () => req.destroy(new Error('ChatterMate request timed out.')));
    req.on('error', reject);
    if (method !== 'GET') req.write(data);
    req.end();
  });
}

let cachedModelId = '';
let cachedForKey = '';

async function getDefaultModelId(apiKey) {
  if (cachedModelId && cachedForKey === apiKey) return cachedModelId;
  const response = await requestChatterMate(apiKey, 'GET', '/api/chat/models');
  if (response.statusCode !== 200) {
    console.error('[ChatterMate] models HTTP ' + response.statusCode);
    if (response.statusCode === 401) throw Object.assign(new Error('ChatterMate rejected the API key (HTTP 401). The key is wrong or was revoked.'), { statusCode: 401 });
    if (response.statusCode === 403) throw Object.assign(new Error('ChatterMate denied access (HTTP 403). Check credits or key permissions.'), { statusCode: 403 });
    throw Object.assign(new Error('Could not load ChatterMate models (HTTP ' + response.statusCode + ').'), { statusCode: 502 });
  }
  let parsed;
  try { parsed = JSON.parse(response.body); } catch (e) { throw new Error('ChatterMate returned invalid JSON for its model list.'); }
  if (!parsed || typeof parsed.default_model_id !== 'string' || !parsed.default_model_id.trim()) {
    throw new Error('The ChatterMate model response did not include default_model_id.');
  }
  cachedModelId = parsed.default_model_id.trim();
  cachedForKey = apiKey;
  return cachedModelId;
}

// à¦¬à¦¾à¦‚à¦²à¦¾: "event: model_chunk"-à¦à¦° à¦ªà¦°à§‡à¦° data à¦²à¦¾à¦‡à¦¨à§‡à¦° content à¦œà§‹à¦¡à¦¼à¦¾ à¦²à¦¾à¦—à¦¿à¦¯à¦¼à§‡ à¦‰à¦¤à§à¦¤à¦° à¦¬à¦¾à¦¨à¦¾à¦¯à¦¼
function parseModelChunkStream(rawText) {
  const normalized = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  let answer = '';
  for (const eventText of normalized.split('\n\n')) {
    let eventName = '';
    const dataLines = [];
    for (const line of eventText.split('\n')) {
      if (line.startsWith('event:')) eventName = line.slice(6).trim();
      else if (line.startsWith('data:')) dataLines.push(line.slice(5).replace(/^ /, ''));
    }
    if (eventName !== 'model_chunk' || !dataLines.length) continue;
    try {
      const item = JSON.parse(dataLines.join('\n'));
      if (item && typeof item.content === 'string') answer += item.content;
    } catch (e) {}
  }
  return answer.trim();
}

async function ask(question, data) {
  const key = getKey();
  if (!key) {
    throw Object.assign(new Error('AI is not connected. Add CHATTERMATE_API_KEY in Vercel > Project Settings > Environment Variables, then redeploy.'), { statusCode: 400 });
  }
  const modelId = await getDefaultModelId(key);
  const response = await requestChatterMate(key, 'POST', '/api/chat/stream', {
    models: [modelId],
    system_prompt: SYSTEM_PROMPT,
    prompt: 'Report data: ' + JSON.stringify(data) + '\nQuestion: ' + question
  });
  if (response.statusCode !== 200) {
    console.error('[ChatterMate] stream HTTP ' + response.statusCode);
    if (response.statusCode === 401) throw Object.assign(new Error('ChatterMate rejected the API key (HTTP 401).'), { statusCode: 401 });
    if (response.statusCode === 403) throw Object.assign(new Error('ChatterMate denied access (HTTP 403). Check credits or key permissions.'), { statusCode: 403 });
    throw Object.assign(new Error('ChatterMate request failed (HTTP ' + response.statusCode + ').'), { statusCode: 502 });
  }
  const answer = parseModelChunkStream(response.body);
  if (!answer) throw new Error('ChatterMate returned no answer text.');
  return answer;
}

module.exports = { getKey, ask };
