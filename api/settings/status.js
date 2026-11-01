// api/settings/status.js — GET /api/settings/status
// বাংলা: key আছে কি না জানায়। canConnect:false মানে Vercel-এ UI থেকে key দেওয়া যায় না।
'use strict';
const { getKey } = require('../_lib');

module.exports = (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'GET') {
    res.statusCode = 405;
    return res.end(JSON.stringify({ error: 'Use GET.' }));
  }
  res.statusCode = 200;
  res.end(JSON.stringify({ keyConfigured: Boolean(getKey()), connected: Boolean(getKey()), canConnect: true, host: 'vercel' }));
};
