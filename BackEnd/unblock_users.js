const { Usuario } = require('./models');

async function unblock() {
  try {
    const user = await Usuario.findOne({ where: { username: 'juanperez' } });
    if (user) {
      await user.update({
        intentos_fallidos: 0,
        bloqueado_hasta: null
      });
      console.log('Usuario juanperez desbloqueado correctamente.');
    } else {
      console.log('Usuario juanperez no encontrado.');
    }
    
    const admin = await Usuario.findOne({ where: { username: 'admin' } });
    if (admin) {
      await admin.update({
        intentos_fallidos: 0,
        bloqueado_hasta: null
      });
      console.log('Usuario admin desbloqueado correctamente.');
    }

    process.exit(0);
  } catch (err) {
    console.error('Error al desbloquear:', err);
    process.exit(1);
  }
}

unblock();
