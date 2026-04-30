const verificarRol = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ error: 'Usuario no autenticado.' });
    }
    
    // Se espera que el JWT incluya el nombre del rol como 'rol_nombre'
    if (!req.usuario.rol_nombre || !rolesPermitidos.includes(req.usuario.rol_nombre)) {
      return res.status(403).json({ error: 'Acceso denegado: no tiene los permisos necesarios.' });
    }
    
    next();
  };
};

module.exports = { verificarRol };
