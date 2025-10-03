const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
  const auth = req.headers.authorization || '';
  const [, token] = auth.split(' ');
  if (!token) return res.status(401).json({ error: 'Token ausente.' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { sub, email, tipo_usuario }
    return next();
  } catch (e) {
    return res.status(401).json({ error: 'Token inválido.' });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Não autenticado.' });
  if (req.user.tipo_usuario !== 'administrador') {
    return res.status(403).json({ error: 'Apenas administradores.' });
  }
  return next();
}

module.exports = { requireAuth, requireAdmin };
