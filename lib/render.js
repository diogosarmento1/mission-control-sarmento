/* render.js
 * Monta a página final do Mission Control a partir do template + dos dados
 * vindos do Apps Script (modo JSON) — mesma lógica de escaping/substituição
 * já usada e testada no MissionControl.gs, só que em Node.
 */
const tpl = require('./template.json').html;

// Separadores de linha/parágrafo Unicode que partem um bloco <script> se
// aparecerem lá dentro literalmente. Construídos a partir do código do
// caracter (nunca escritos diretamente aqui) para evitar caracteres
// invisíveis reais no ficheiro fonte.
var LINE_SEP = String.fromCharCode(0x2028);
var PARA_SEP = String.fromCharCode(0x2029);

function escJsStringContext(s) {
  return String(s)
    .split(LINE_SEP).join('\\u2028')
    .split(PARA_SEP).join('\\u2029')
    .replace(/<\/script/gi, '<\\/script');
}

function safeReplace(texto, marcador, valor) {
  return texto.replace(marcador, function () { return valor; });
}

function montarPagina(payload) {
  const dataJson = escJsStringContext(JSON.stringify(payload.data));
  const logo = escJsStringContext(payload.logo || '');
  const snapdate = payload.snapdate || '';

  var html = tpl;
  html = safeReplace(html, '__DATA__', dataJson);
  html = safeReplace(html, '__SNAPDATE__', snapdate);
  html = safeReplace(html, '__LOGO__', logo);
  return html;
}

module.exports = { montarPagina: montarPagina };
