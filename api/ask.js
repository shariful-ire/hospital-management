// api/ask.js — Vercel ফাংশন: POST /api/ask { question, data } -> { answer }
// বাংলা: key আসে Vercel Environment Variable থেকে; ব্রাউজারে কখনো যায় না।
'use strict';
const { ask } = require('./_lib');

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.statusCode = 405;
    return res.end(JSON.stringify({ error: 'Use POST.' }));
  }
  try {
    let body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
    body = body && typeof body === 'object' ? body : {};
    const question = typeof body.question === 'string' ? body.question.trim() : '';
    const data = body.data && typeof body.data === 'object' ? body.data : {};
    if (!question) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ error: 'Question cannot be empty.' }));
    }
    const answer = await ask(question, data);
    res.statusCode = 200;
    return res.end(JSON.stringify({ answer }));
  } catch (error) {
    const code = error.statusCode || 502;
    console.error('[/api/ask] HTTP ' + code + ': ' + error.message);
    res.statusCode = code;
    return res.end(JSON.stringify({ error: error.message || 'Could not get an answer from ChatterMate.' }));
  }
};
