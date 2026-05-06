const { Usuario } = require('./models');
async function check() {
  try {
    const usuarios = await Usuario.findAll({ attributes: ['username', 'id'] });
    console.log('Usuarios encontrados:', JSON.stringify(usuarios, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
check();
