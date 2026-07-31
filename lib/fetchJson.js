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

// Sem um User-Agent parecido com o de um browser, alguns pedidos feitos a
// partir de servidores (como o da Vercel) à Google acabam por receber uma
// página de aviso/verificação em HTML em vez do conteúdo — mesmo que o
// mesmo link, aberto diretamente num navegador normal, funcione bem.
var HEADERS_PEDIDO_ = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'application/json,text/plain,*/*'
};

function getUma(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { timeout: TIMEOUT_MS, headers: HEADERS_PEDIDO_ }, (resp) => {
      var chunks = [];
      resp.on('data', function (c) { chunks.push(c); });
      resp.on('end', function () {
        resolve({ status: resp.statusCode, headers: resp.headers, body: Buffer.concat(chunks).toString('utf8') });
      });
    }).on('error', reject).on('timeout', function () { reject(new Error('timeout')); });
  });
}

function descreverResposta_(url, resp) {
  return 'URL: ' + url +
    ' | HTTP ' + resp.status +
    ' | content-type: ' + (resp.headers['content-type'] || '(nenhum)') +
    ' | tamanho do corpo: ' + resp.body.length + ' caracteres' +
    (resp.body.length ? ' | início: ' + resp.body.slice(0, 200) : ' | corpo vazio');
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
      throw new Error('Resposta inesperada do Apps Script (salto ' + i + '). ' + descreverResposta_(atual, resp));
    }
    try {
      return JSON.parse(resp.body);
    } catch (err) {
      // Se isto acontecer outra vez, esta mensagem diz logo o que veio
      // realmente na resposta (URL final, estado HTTP, tipo de conteúdo,
      // tamanho e início do corpo), sem precisar de testar o link à parte.
      throw new Error('Resposta do Apps Script não é JSON válido (salto ' + i + '). ' + descreverResposta_(atual, resp));
    }
  }
  throw new Error('Demasiados redireccionamentos ao contactar o Apps Script (parou em: ' + atual + ').');
}

module.exports = { fetchJson: fetchJson };
