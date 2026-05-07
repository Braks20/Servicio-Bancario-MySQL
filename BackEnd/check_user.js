const { Usuario, Role, Cliente } = require('./models');

async function checkUser() {
  try {
    const user = await Usuario.findOne({
      where: { username: 'juanperez' },
      include: [{ model: Role, as: 'rol' }]
    });
    if (user) {
      console.log('Usuario encontrado:', JSON.stringify({
        id: user.id,
        username: user.username,
        rol: user.rol.nombre,
        estado: user.estado,
        password_hash: user.password_hash ? 'Presente' : 'Ausente'
      }, null, 2));
    } else {
      console.log('Usuario juanperez no encontrado');
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkUser();
