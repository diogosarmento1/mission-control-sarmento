const auth = require('../lib/auth');

module.exports = (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Método não permitido.');
    return;
  }

  const AUTH_USERNAME = process.env.AUTH_USERNAME || '';
  const AUTH_PASSWORD_HASH = process.env.AUTH_PASSWORD_HASH || '';
  const SESSION_SECRET = process.env.SESSION_SECRET || '';

  if (!AUTH_USERNAME || !AUTH_PASSWORD_HASH || !SESSION_SECRET) {
    res.status(500).send('Configuração em falta no servidor (variáveis de ambiente).');
    return;
  }

  const body = req.body || {};
  const username = String(body.username || '').trim();
  const password = String(body.password || '');

  const ok = username === AUTH_USERNAME && auth.verificarPassword(password, AUTH_PASSWORD_HASH);
  if (!ok) {
    res.writeHead(302, { Location: '/login?erro=1' });
    res.end();
    return;
  }

  const token = auth.assinarSessao(username, SESSION_SECRET);
  const maxAge = 60 * 60 * 24 * 30; // 30 dias, em segundos
  res.setHeader('Set-Cookie', auth.COOKIE_NAME + '=' + token + '; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=' + maxAge);
  res.writeHead(302, { Location: '/' });
  res.end();
};
