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
  }
};

module.exports = usuarioController;
