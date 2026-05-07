const { Notificacion } = require('../models');

const notificacionController = {
  // GET /api/notificaciones
  listar: async (req, res) => {
    try {
      const cliente_id = req.usuario.cliente_id;
      if (!cliente_id) return res.status(200).json([]);

      const notificaciones = await Notificacion.findAll({
        where: { cliente_id },
        order: [['created_at', 'DESC']]
      });
      return res.status(200).json(notificaciones);
    } catch (error) {
      console.error('Error al listar notificaciones:', error);
      return res.status(500).json({ error: 'Error interno del servidor.' });
    }
  },

  // PATCH /api/notificaciones/:id/leer
  marcarLeida: async (req, res) => {
    try {
      const { id } = req.params;
      const notificacion = await Notificacion.findByPk(id);
      if (!notificacion) return res.status(404).json({ error: 'Notificación no encontrada.' });

      await notificacion.update({ leida: true });
      return res.status(200).json({ mensaje: 'Notificación marcada como leída.' });
    } catch (error) {
      console.error('Error al marcar notificación:', error);
      return res.status(500).json({ error: 'Error interno del servidor.' });
    }
  }
};

module.exports = notificacionController;
