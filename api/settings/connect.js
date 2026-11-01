'use strict';
const { validateKey } = require('../_lib');
const WINDOW_MS = 60 * 1000;
const MAX_ATTEMPTS_PER_WINDOW = 5;
const attemptsByIp = new Map();

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'POST') {
    res.statusCode = 405;
    return res.end(JSON.stringify({ error: 'Use POST.' }));
  }
  const forwardedFor = req.headers['x-forwarded-for'];
  const clientIp = (typeof forwardedFor === 'string' ? forwardedFor.split(',').pop().trim() : '') || 'unknown';
  const now = Date.now();
  const attempts = attemptsByIp.get(clientIp);
  if (attempts && now - attempts.startedAt < WINDOW_MS && attempts.count >= MAX_ATTEMPTS_PER_WINDOW) {
    res.statusCode = 429;
    res.setHeader('Retry-After', '60');
    return res.end(JSON.stringify({ error: 'Too many connection attempts. Wait one minute and try again.' }));
  }
  if (!attempts || now - attempts.startedAt >= WINDOW_MS) attemptsByIp.set(clientIp, { startedAt: now, count: 1 });
  else attempts.count += 1;
  try {
    let body = req.body;
    if (typeof body === 'string') {
      if (Buffer.byteLength(body, 'utf8') > 2048) {
        res.statusCode = 413;
        return res.end(JSON.stringify({ error: 'Request body is too large.' }));
      }
      try { body = JSON.parse(body); } catch (_) { body = {}; }
    }
    const apiKey = body && typeof body.apiKey === 'string' ? body.apiKey.trim() : '';
    if (!apiKey || apiKey.length > 512) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ error: 'Enter a valid ChatterMate API key.' }));
    }
    await validateKey(apiKey);
    res.statusCode = 200;
    return res.end(JSON.stringify({ connected: true, message: 'Key validated. It is kept in this browser tab only.' }));
  } catch (error) {
    const statusCode = error.statusCode || 502;
    console.error('[Settings] Connect failed (HTTP ' + statusCode + ').');
    res.statusCode = statusCode;
    return res.end(JSON.stringify({ error: error.message || 'Could not validate the API key.' }));
  }
};
