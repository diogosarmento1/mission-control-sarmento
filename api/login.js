const auth = require('../lib/auth');

module.exports = (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Método não permitido.');
    return;
  }

  // .trim() por segurança — um espaço/tab colado sem querer numa variável de
  // ambiente já causou um bug confuso (chave a não bater certo) noutro sítio.
  // AUTH_USERS é uma lista JSON de utilizadores, ex.:
  // [{"username":"diogo","passwordHash":"..."},{"username":"chefe","passwordHash":"..."}]
  const AUTH_USERS = (process.env.AUTH_USERS || '').trim();
  const SESSION_SECRET = (process.env.SESSION_SECRET || '').trim();

  if (!AUTH_USERS || !SESSION_SECRET) {
    res.status(500).send('Configuração em falta no servidor (variáveis de ambiente).');
    return;
  }

  const body = req.body || {};
  const username = String(body.username || '').trim();
  const password = String(body.password || '');

  const ok = auth.autenticar(AUTH_USERS, username, password);
  if (!ok) {
    // Vai direto para login.html (em vez de /login, que depende do rewrite
    // preservar o "?erro=1") — assim a mensagem de erro aparece sempre,
    // sem depender de nenhum comportamento implícito da Vercel.
    res.writeHead(302, { Location: '/login.html?erro=1' });
    res.end();
    return;
  }

  const token = auth.assinarSessao(username, SESSION_SECRET);
  const maxAge = 60 * 60 * 24 * 30; // 30 dias, em segundos
  res.setHeader('Set-Cookie', auth.COOKIE_NAME + '=' + token + '; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=' + maxAge);
  res.writeHead(302, { Location: '/' });
  res.end();
};
