const { LogAuditoria, Usuario, Sequelize } = require('../models');

const auditoriaController = {
  // GET /api/auditoria
  listar: async (req, res) => {
    try {
      const { usuario_id, accion, tabla_afectada, fecha_inicio, fecha_fin, page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      let whereClause = {};

      if (usuario_id) whereClause.usuario_id = usuario_id;
      if (accion) whereClause.accion = accion;
      if (tabla_afectada) whereClause.tabla_afectada = tabla_afectada;

      if (fecha_inicio && fecha_fin) {
        whereClause.created_at = {
          [Sequelize.Op.between]: [new Date(fecha_inicio), new Date(fecha_fin)]
        };
      }

      const { count, rows: logs } = await LogAuditoria.findAndCountAll({
        where: whereClause,
        include: [
          { model: Usuario, as: 'usuario', attributes: ['username', 'rol_id'] }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']]
      });

      return res.status(200).json({
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit),
        data: logs
      });
    } catch (error) {
      console.error('Error al listar auditoría:', error);
      return res.status(500).json({ error: 'Error interno del servidor.' });
    }
  },

  // GET /api/auditoria/:id
  obtener: async (req, res) => {
    try {
      const { id } = req.params;
      const log = await LogAuditoria.findByPk(id, {
        include: [
          { model: Usuario, as: 'usuario', attributes: ['username', 'rol_id'] }
        ]
      });

      if (!log) {
        return res.status(404).json({ error: 'Registro de auditoría no encontrado.' });
      }

      return res.status(200).json(log);
    } catch (error) {
      console.error('Error al obtener registro de auditoría:', error);
      return res.status(500).json({ error: 'Error interno del servidor.' });
    }
  }
};

module.exports = auditoriaController;
