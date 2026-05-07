const cron = require('node-cron');
const { TarjetaCredito, Usuario, Cliente } = require('./models');
const { Op } = require('sequelize');

const initCronJobs = () => {
  // Se ejecuta todos los días a la medianoche
  cron.schedule('0 0 * * *', async () => {
    console.log('Ejecutando validación de límite de deuda de tarjetas...');
    try {
      // Buscar tarjetas con saldo_utilizado > 100,000 que estén activas
      const tarjetasExcedidas = await TarjetaCredito.findAll({
        where: {
          saldo_utilizado: { [Op.gt]: 100000 },
          estado: 'activa'
        },
        include: [{ model: Cliente, as: 'cliente' }]
      });

      for (const tarjeta of tarjetasExcedidas) {
        console.log(`Bloqueando tarjeta ${tarjeta.numero_tarjeta} del cliente ${tarjeta.cliente_id} por exceso de deuda.`);
        await tarjeta.update({ estado: 'bloqueada' });

        // Opcional: También bloquear al usuario asociado
        const usuario = await Usuario.findOne({ where: { cliente_id: tarjeta.cliente_id } });
        if (usuario) {
          await usuario.update({ estado: 'inactivo' });
          console.log(`Usuario ${usuario.username} desactivado automáticamente.`);
        }
      }
    } catch (error) {
      console.error('Error en Cron Job de tarjetas:', error);
    }
  });
};

module.exports = { initCronJobs };
