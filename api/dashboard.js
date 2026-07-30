const auth = require('../lib/auth');
const { montarPagina } = require('../lib/render');
const { fetchJson } = require('../lib/fetchJson');

module.exports = async (req, res) => {
  const SESSION_SECRET = process.env.SESSION_SECRET || '';
  const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL || '';
  const APPS_SCRIPT_KEY = process.env.APPS_SCRIPT_KEY || '';

  if (!SESSION_SECRET || !APPS_SCRIPT_URL || !APPS_SCRIPT_KEY) {
    res.status(500).send('Configuração em falta no servidor (variáveis de ambiente).');
    return;
  }

  const token = auth.lerCookie(req, auth.COOKIE_NAME);
  const sessao = auth.verificarSessao(token, SESSION_SECRET);
  if (!sessao) {
    res.writeHead(302, { Location: '/login' });
    res.end();
    return;
  }

  try {
    const separador = APPS_SCRIPT_URL.indexOf('?') === -1 ? '?' : '&';
    const url = APPS_SCRIPT_URL + separador + 'formato=json&chave=' + encodeURIComponent(APPS_SCRIPT_KEY);
    const payload = await fetchJson(url);
    const html = montarPagina(payload);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(html);
  } catch (err) {
    res.status(502).send('Não foi possível carregar os dados agora. Tenta novamente daqui a pouco. (' + err.message + ')');
  }
};
