function requireLogin(req, res, next) {
  if (req.session.user) return next();
  return res.status(401).json({ error: 'Please log in first' });
}

function requireAdmin(req, res, next) {
  if (req.session.user && req.session.user.role === 'admin') return next();
  return res.status(403).json({ error: 'Admins only' });
}

module.exports = { requireLogin, requireAdmin };