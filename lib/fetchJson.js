/* fetchJson.js
 * Vai buscar JSON a um URL, seguindo manualmente redireccionamentos 3xx —
 * necessário porque o link /exec do Apps Script normalmente redireciona
 * para um URL script.googleusercontent.com, e o https.get do Node não segue
 * redireccionamentos sozinho.
 */
const https = require('https');

// O Apps Script pode demorar perto de um minuto a montar os dados quando a
// sua própria cache ainda não está "quente" (ver CACHE_TTL_SEGUNDOS_ em
// MissionControl.gs) — por isso este timeout tem de ser generoso, não os
// poucos segundos habituais de um pedido HTTP normal.
var TIMEOUT_MS = 55000;

function getUma(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { timeout: TIMEOUT_MS }, (resp) => {
      var chunks = [];
      resp.on('data', function (c) { chunks.push(c); });
      resp.on('end', function () {
        resolve({ status: resp.statusCode, headers: resp.headers, body: Buffer.concat(chunks).toString('utf8') });
      });
    }).on('error', reject).on('timeout', function () { reject(new Error('timeout')); });
  });
}

async function fetchJson(url, maxSaltos) {
  var atual = url;
  var saltos = typeof maxSaltos === 'number' ? maxSaltos : 5;
  for (var i = 0; i < saltos; i++) {
    var resp = await getUma(atual);
    if (resp.status >= 300 && resp.status < 400 && resp.headers.location) {
      atual = resp.headers.location;
      continue;
    }
    if (resp.status !== 200) {
      throw new Error('Resposta inesperada do Apps Script: HTTP ' + resp.status);
    }
    return JSON.parse(resp.body);
  }
  throw new Error('Demasiados redireccionamentos ao contactar o Apps Script.');
}

module.exports = { fetchJson: fetchJson };
