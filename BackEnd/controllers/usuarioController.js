const { Usuario } = require('../models');
const { registrarAuditoria } = require('../middlewares/auditoria');

const usuarioController = {
  // POST /api/usuarios/:id/desbloquear
  desbloquear: async (req, res) => {
    try {
      const { id } = req.params;

      const usuario = await Usuario.findByPk(id);
      if (!usuario) {
        return res.status(404).json({ error: 'Usuario no encontrado.' });
      }

      // Restablecer los intentos y quitar el bloqueo
      await usuario.update({
        intentos_fallidos: 0,
        bloqueado_hasta: null
      });

      // Registrar la acción de desbloqueo en la auditoría
      await registrarAuditoria(
        { usuario: req.usuario, ip: req.ip, headers: req.headers }, 
        'DESBLOQUEO_CUENTA', 
        'Usuarios', 
        usuario.id
      );

      return res.status(200).json({ 
        mensaje: `La cuenta del usuario '${usuario.username}' ha sido desbloqueada exitosamente.` 
      });

    } catch (error) {
      console.error('Error al desbloquear usuario:', error);
      return res.status(500).json({ error: 'Error interno del servidor.' });
    }
  },

  // GET /api/usuarios
  listar: async (req, res) => {
    try {
      const { rol_id, estado } = req.query;
      let whereClause = {};
      if (rol_id) whereClause.rol_id = rol_id;
      if (estado) whereClause.estado = estado;

      const usuarios = await Usuario.findAll({
        where: whereClause,
        include: [
          { model: require('../models').Role, as: 'rol', attributes: ['nombre'] },
          { model: require('../models').Cliente, as: 'cliente', attributes: ['nombre', 'apellido'] }
        ],
        attributes: { exclude: ['password_hash'] }
      });

      return res.status(200).json(usuarios);
    } catch (error) {
      console.error('Error al listar usuarios:', error);
      return res.status(500).json({ error: 'Error interno del servidor.' });
    }
  },

  // PATCH /api/usuarios/:id/estado
  cambiarEstado: async (req, res) => {
    try {
      const { id } = req.params;
      const { estado } = req.body;

      if (!['activo', 'inactivo'].includes(estado)) {
        return res.status(400).json({ error: 'Estado no válido. Debe ser activo o inactivo.' });
      }

      const usuario = await Usuario.findByPk(id);
      if (!usuario) {
        return res.status(404).json({ error: 'Usuario no encontrado.' });
      }

      const datosAnteriores = usuario.toJSON();
      await usuario.update({ estado });

      await registrarAuditoria(
        { usuario: req.usuario, ip: req.ip, headers: req.headers },
        'CAMBIO_ESTADO_USUARIO',
        'Usuarios',
        usuario.id,
        datosAnteriores,
        usuario.toJSON()
      );

      return res.status(200).json({ mensaje: `Estado del usuario ${usuario.username} cambiado a ${estado}.` });
    } catch (error) {
      console.error('Error al cambiar estado de usuario:', error);
      return res.status(500).json({ error: 'Error interno del servidor.' });
    }
  }
};

module.exports = usuarioController;
