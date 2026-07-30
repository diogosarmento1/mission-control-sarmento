const auth = require('../lib/auth');

module.exports = (req, res) => {
  res.setHeader('Set-Cookie', auth.COOKIE_NAME + '=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0');
  res.writeHead(302, { Location: '/login' });
  res.end();
};
