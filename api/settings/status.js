// api/settings/status.js — GET /api/settings/status
// বাংলা: key আছে কি না জানায়। canConnect:false মানে Vercel-এ UI থেকে key দেওয়া যায় না।
'use strict';
const { getKey } = require('../_lib');

module.exports = (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.statusCode = 200;
  res.end(JSON.stringify({ connected: Boolean(getKey()), canConnect: false, host: 'vercel' }));
};
