const { Usuario, Transaccion, LogAuditoria, SolicitudCuenta, Cliente, sequelize, Sequelize } = require('../models');
const { Op } = Sequelize;

const statsController = {
  getDashboardStats: async (req, res) => {
    try {
      // 1. Total Usuarios Activos
      const totalUsers = await Usuario.count({ where: { estado: 'activo' } });

      // 2. Volumen Transaccional (Hoy)
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const transactionalVolume = await Transaccion.sum('monto', {
        where: {
          estado: 'completada',
          created_at: { [Op.between]: [startOfDay, endOfDay] }
        }
      }) || 0;

      // 3. Alertas de Seguridad
      const securityAlerts = await LogAuditoria.count({
        where: {
          accion: 'BLOQUEO_CUENTA',
          created_at: { [Op.gte]: startOfDay }
        }
      });

      const pendingRequests = await SolicitudCuenta.count({
        where: { estado: 'pendiente' }
      });

      // 4. Crecimiento de la plataforma (Últimos 6 meses)
      const last6Months = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

        const count = await Cliente.count({
          where: {
            created_at: { [Op.between]: [monthStart, monthEnd] }
          }
        });

        last6Months.push({
          month: monthStart.toLocaleString('default', { month: 'short' }),
          count
        });
      }

      // 5. Tipos de Transacciones (Distribución)
      const transactionTypes = await Transaccion.findAll({
        attributes: [
          'tipo',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        where: { estado: 'completada' },
        group: ['tipo'],
        raw: true
      });

      return res.status(200).json({
        kpis: {
          totalUsers,
          transactionalVolume,
          securityAlerts: securityAlerts + pendingRequests,
          pendingRequests
        },
        platformGrowth: last6Months,
        transactionDistribution: transactionTypes
      });
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      return res.status(500).json({ error: 'Error interno al procesar estadísticas.' });
    }
  }
};

module.exports = statsController;
