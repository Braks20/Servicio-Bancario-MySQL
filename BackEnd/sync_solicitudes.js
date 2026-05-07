const { sequelize, SolicitudCuenta } = require('./models');

async function sync() {
  try {
    await SolicitudCuenta.sync();
    console.log('Tabla SolicitudCuenta sincronizada correctamente.');
    process.exit(0);
  } catch (err) {
    console.error('Error al sincronizar:', err);
    process.exit(1);
  }
}

sync();
