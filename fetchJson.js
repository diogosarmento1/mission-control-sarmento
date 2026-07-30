/* fetchJson.js
 * Vai buscar JSON a um URL, seguindo manualmente redireccionamentos 3xx —
 * necessário porque o link /exec do Apps Script normalmente redireciona
 * para um URL script.googleusercontent.com, e o https.get do Node não segue
 * redireccionamentos sozinho.
 */
const https = require('https');

function getUma(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { timeout: 20000 }, (resp) => {
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
