const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(403).json({ error: 'No se proporcionó un token de acceso.' });
  }

  // Si el token viene con formato "Bearer <token>"
  const tokenLimpio = token.startsWith('Bearer ') ? token.slice(7, token.length) : token;

  jwt.verify(tokenLimpio, process.env.JWT_SECRET || 'secret_key_temporal', (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Token inválido o expirado.' });
    }
    // Guardamos la información decodificada del usuario en la request
    req.usuario = decoded;
    next();
  });
};

module.exports = { verificarToken };
