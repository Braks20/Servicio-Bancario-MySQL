const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Usuario, Role, Cliente } = require('../models');
const { registrarAuditoria } = require('../middlewares/auditoria');
const { Op } = require('sequelize');

const authController = {
  // POST /api/auth/login
  login: async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: 'Usuario y contraseña son requeridos.' });
      }

      // Buscar usuario incluyendo su rol y cliente
      const usuario = await Usuario.findOne({
        where: { username },
        include: [
          { model: Role, as: 'rol' },
          { model: Cliente, as: 'cliente' }
        ]
      });

      if (!usuario) {
        return res.status(401).json({ error: 'Credenciales inválidas.' });
      }

      // Verificar si el usuario está inactivo
      if (usuario.estado !== 'activo') {
        return res.status(403).json({ error: 'Usuario inactivo. Contacte a soporte.' });
      }

      // Verificar si está bloqueado por intentos fallidos
      if (usuario.bloqueado_hasta && new Date() < usuario.bloqueado_hasta) {
        return res.status(403).json({ error: 'Cuenta bloqueada temporalmente por intentos fallidos. Intente más tarde.' });
      }

      // Comparar contraseñas
      const isValidPassword = await bcrypt.compare(password, usuario.password_hash);

      if (!isValidPassword) {
        // Incrementar intentos fallidos
        const nuevosIntentos = usuario.intentos_fallidos + 1;
        let updateData = { intentos_fallidos: nuevosIntentos };

        if (nuevosIntentos >= 5) {
          // Bloquear por 30 minutos
          const bloqueadoHasta = new Date(Date.now() + 30 * 60 * 1000);
          updateData.bloqueado_hasta = bloqueadoHasta;
          
          await registrarAuditoria({ ip: req.ip, headers: req.headers }, 'BLOQUEO_CUENTA', 'Usuarios', usuario.id);
        }

        await usuario.update(updateData);
        return res.status(401).json({ error: 'Credenciales inválidas.' });
      }

      // Contraseña correcta: resetear intentos y actualizar último acceso
      await usuario.update({
        intentos_fallidos: 0,
        bloqueado_hasta: null,
        ultimo_acceso: new Date()
      });

      // Crear JWT
      const payload = {
        id: usuario.id,
        username: usuario.username,
        rol_id: usuario.rol_id,
        rol_nombre: usuario.rol.nombre, // Necesario para el middleware de roles
        cliente_id: usuario.cliente_id
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret_key_temporal', {
        expiresIn: '2h' // El token expira en 2 horas
      });

      await registrarAuditoria({ usuario, ip: req.ip, headers: req.headers }, 'LOGIN', 'Usuarios', usuario.id);

      return res.status(200).json({
        mensaje: 'Login exitoso',
        token,
        usuario: {
          id: usuario.id,
          username: usuario.username,
          rol: usuario.rol.nombre,
          cliente: usuario.cliente ? { id: usuario.cliente.id, nombre: usuario.cliente.nombre, apellido: usuario.cliente.apellido } : null
        }
      });
    } catch (error) {
      console.error('Error en login:', error);
      return res.status(500).json({ error: 'Error interno del servidor.' });
    }
  },

  // POST /api/auth/logout
  logout: async (req, res) => {
    try {
      // El logout en JWT es manejado mayormente por el cliente (borrando el token).
      // Aquí solo registramos el evento de cierre de sesión en auditoría.
      if (req.usuario) {
        await registrarAuditoria(req, 'LOGOUT', 'Usuarios', req.usuario.id);
      }
      return res.status(200).json({ mensaje: 'Sesión cerrada exitosamente.' });
    } catch (error) {
      console.error('Error en logout:', error);
      return res.status(500).json({ error: 'Error interno del servidor.' });
    }
  },

  // PUT /api/auth/cambiar-password
  cambiarPassword: async (req, res) => {
    try {
      const { password_actual, password_nueva } = req.body;
      const usuarioId = req.usuario.id;

      if (!password_actual || !password_nueva) {
        return res.status(400).json({ error: 'Ambas contraseñas son requeridas.' });
      }

      if (password_actual === password_nueva) {
         return res.status(400).json({ error: 'La nueva contraseña no puede ser igual a la actual.' });
      }

      const usuario = await Usuario.findByPk(usuarioId);
      if (!usuario) {
        return res.status(404).json({ error: 'Usuario no encontrado.' });
      }

      const isValidPassword = await bcrypt.compare(password_actual, usuario.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'La contraseña actual es incorrecta.' });
      }

      // Hashear nueva contraseña
      const saltRounds = 10;
      const nuevaPasswordHash = await bcrypt.hash(password_nueva, saltRounds);

      await usuario.update({ password_hash: nuevaPasswordHash });

      await registrarAuditoria(req, 'CAMBIO_PASSWORD', 'Usuarios', usuario.id);

      return res.status(200).json({ mensaje: 'Contraseña actualizada exitosamente.' });
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      return res.status(500).json({ error: 'Error interno del servidor.' });
    }
  },

  // GET /api/auth/perfil
  perfil: async (req, res) => {
    try {
      const usuarioId = req.usuario.id;

      const usuario = await Usuario.findByPk(usuarioId, {
        attributes: { exclude: ['password_hash'] },
        include: [
          { model: Role, as: 'rol', attributes: ['id', 'nombre'] },
          { model: Cliente, as: 'cliente' }
        ]
      });

      if (!usuario) {
        return res.status(404).json({ error: 'Usuario no encontrado.' });
      }

      return res.status(200).json(usuario);
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      return res.status(500).json({ error: 'Error interno del servidor.' });
    }
  }
};

module.exports = authController;
