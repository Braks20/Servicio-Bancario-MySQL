const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
  let token = req.cookies.token;
  
  if (!token) {
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7, authHeader.length);
    }
  }

  if (!token) {
    console.log(`AUTH ERROR: No se encontró token en cookies ni en headers. Cookies recibidas:`, req.cookies);
    return res.status(403).json({ error: 'No se proporcionó un token de acceso.' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'secret_key_temporal', (err, decoded) => {
    if (err) {
      console.log(`AUTH ERROR: Token inválido o expirado. Error: ${err.message}`);
      return res.status(401).json({ error: 'Token inválido o expirado.' });
    }
    // Guardamos la información decodificada del usuario en la request
    req.usuario = decoded;
    next();
  });
};

module.exports = { verificarToken };
