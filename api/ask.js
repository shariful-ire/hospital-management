// api/ask.js — Vercel ফাংশন: POST /api/ask { question, data } -> { answer }
// বাংলা: key আসে Vercel Environment Variable থেকে; ব্রাউজারে কখনো যায় না।
'use strict';
const { ask } = require('./_lib');

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 20;
const requestWindows = new Map();

function isRateLimited(req) {
  const forwardedFor = req.headers['x-forwarded-for'];
  const clientIp = (typeof forwardedFor === 'string' ? forwardedFor.split(',').pop().trim() : '') || 'unknown';
  const now = Date.now();
  const windowStart = requestWindows.get(clientIp);
  if (requestWindows.size > 500) {
    for (const [ip, entry] of requestWindows) {
      if (now - entry.startedAt >= WINDOW_MS) requestWindows.delete(ip);
    }
  }
  if (!windowStart || now - windowStart.startedAt >= WINDOW_MS) {
    requestWindows.set(clientIp, { startedAt: now, count: 1 });
    return false;
  }
  windowStart.count += 1;
  return windowStart.count > MAX_REQUESTS_PER_WINDOW;
}

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'POST') {
    res.statusCode = 405;
    return res.end(JSON.stringify({ error: 'Use POST.' }));
  }
  if (isRateLimited(req)) {
    res.statusCode = 429;
    res.setHeader('Retry-After', '600');
    return res.end(JSON.stringify({ error: 'Too many AI requests. Try again in a few minutes.' }));
  }
  try {
    let body = req.body;
    if (typeof body === 'string') {
      if (Buffer.byteLength(body, 'utf8') > 100 * 1024) {
        res.statusCode = 413;
        return res.end(JSON.stringify({ error: 'Request body is too large.' }));
      }
      try { body = JSON.parse(body); } catch (e) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: 'Request body must be valid JSON.' }));
      }
    }
    body = body && typeof body === 'object' ? body : {};
    if (Buffer.byteLength(JSON.stringify(body), 'utf8') > 100 * 1024) {
      res.statusCode = 413;
      return res.end(JSON.stringify({ error: 'Request body is too large.' }));
    }
    const question = typeof body.question === 'string' ? body.question.trim() : '';
    const data = body.data && typeof body.data === 'object' ? body.data : {};
    const apiKey = typeof body.apiKey === 'string' ? body.apiKey.trim() : '';
    if (apiKey.length > 512) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ error: 'API key is too long.' }));
    }
    if (Buffer.byteLength(JSON.stringify(data), 'utf8') > 80 * 1024) {
      res.statusCode = 413;
      return res.end(JSON.stringify({ error: 'Report data is too large.' }));
    }
    if (!question) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ error: 'Question cannot be empty.' }));
    }
    if (question.length > 2000) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ error: 'Question must be 2,000 characters or fewer.' }));
    }
    const answer = await ask(question, data, apiKey);
    res.statusCode = 200;
    return res.end(JSON.stringify({ answer }));
  } catch (error) {
    const code = error.statusCode || 502;
    console.error('[/api/ask] HTTP ' + code + ': ' + error.message);
    res.statusCode = code;
    return res.end(JSON.stringify({ error: error.message || 'Could not get an answer from ChatterMate.' }));
  }
};
