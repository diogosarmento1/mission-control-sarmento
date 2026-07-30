/* auth.js
 * Sessão simples baseada num cookie assinado (HMAC), sem base de dados.
 * Pensado para um número pequeno de utilizadores (config via variáveis de
 * ambiente no Vercel), não um sistema de contas completo.
 */
const crypto = require('crypto');

const COOKIE_NAME = 'sessao';
const SESSION_DIAS = 30;

function base64urlEncode(buf) {
  return Buffer.from(buf).toString('base64url');
}
function base64urlDecode(str) {
  return Buffer.from(str, 'base64url');
}

/* Gera o hash de uma password para colocar em AUTH_PASSWORD_HASH.
 * Formato guardado: "<salt-hex>:<hash-hex>". Chamar isto uma vez (script à
 * parte) para gerar o valor, nunca guardar a password em texto simples. */
function gerarHashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return salt + ':' + hash;
}

function verificarPassword(password, hashGuardado) {
  if (!hashGuardado || hashGuardado.indexOf(':') === -1) return false;
  const partes = hashGuardado.split(':');
  const salt = partes[0];
  const hashHex = partes[1];
  const hashCalculado = crypto.scryptSync(password, salt, 64);
  const hashEsperado = Buffer.from(hashHex, 'hex');
  if (hashCalculado.length !== hashEsperado.length) return false;
  return crypto.timingSafeEqual(hashCalculado, hashEsperado);
}

function assinarSessao(username, segredoSessao) {
  const exp = Date.now() + 1000 * 60 * 60 * 24 * SESSION_DIAS;
  const payload = base64urlEncode(JSON.stringify({ u: username, exp: exp }));
  const assinatura = crypto.createHmac('sha256', segredoSessao).update(payload).digest('base64url');
  return payload + '.' + assinatura;
}

function verificarSessao(token, segredoSessao) {
  if (!token || token.indexOf('.') === -1) return null;
  const idx = token.lastIndexOf('.');
  const payload = token.slice(0, idx);
  const assinatura = token.slice(idx + 1);
  const assinaturaEsperada = crypto.createHmac('sha256', segredoSessao).update(payload).digest('base64url');
  const a = Buffer.from(assinatura);
  const b = Buffer.from(assinaturaEsperada);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  var dados;
  try {
    dados = JSON.parse(base64urlDecode(payload).toString('utf8'));
  } catch (err) {
    return null;
  }
  if (!dados || !dados.exp || dados.exp < Date.now()) return null;
  return dados;
}

function lerCookie(req, nome) {
  const cabecalho = req.headers.cookie || '';
  const partes = cabecalho.split(';');
  for (var i = 0; i < partes.length; i++) {
    var par = partes[i].trim().split('=');
    if (par[0] === nome) return decodeURIComponent(par.slice(1).join('='));
  }
  return null;
}

module.exports = {
  COOKIE_NAME: COOKIE_NAME,
  gerarHashPassword: gerarHashPassword,
  verificarPassword: verificarPassword,
  assinarSessao: assinarSessao,
  verificarSessao: verificarSessao,
  lerCookie: lerCookie
};
