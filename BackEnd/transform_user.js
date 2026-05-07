const { sequelize, Usuario, Cliente, Cuenta, Transaccion, SolicitudCuenta, Notificacion, LogAuditoria } = require('./models');
const bcrypt = require('bcrypt');

async function transformUser() {
  const t = await sequelize.transaction();
  try {
    const clienteId = 1;
    const usuarioId = 2;

    // 1. Eliminar datos antiguos (Juan Perez)
    console.log('Eliminando datos de Juan Perez...');
    await Transaccion.destroy({ where: { [sequelize.Sequelize.Op.or]: [{ cuenta_origen: clienteId }, { cuenta_destino: clienteId }] }, transaction: t }).catch(e => console.log('Sin transacciones'));
    await Cuenta.destroy({ where: { cliente_id: clienteId }, transaction: t });
    await SolicitudCuenta.destroy({ where: { cliente_id: clienteId }, transaction: t });
    await Notificacion.destroy({ where: { cliente_id: clienteId }, transaction: t });
    await LogAuditoria.destroy({ where: { usuario_id: usuarioId }, transaction: t });
    await Usuario.destroy({ where: { id: usuarioId }, transaction: t });
    await Cliente.destroy({ where: { id: clienteId }, transaction: t });

    // 2. Crear nuevo usuario (Braksley Camacho)
    console.log('Creando nuevo usuario: BRAKSLEY ROBERTO CAMACHO GARCIA...');
    const nuevoCliente = await Cliente.create({
      id: clienteId, // Reutilizamos ID para no romper asociaciones si hubiera
      nombre: 'BRAKSLEY ROBERTO',
      apellido: 'CAMACHO GARCIA',
      dpi: '605100869',
      email: 'braksley@banco.cr',
      telefono: '88887777',
      fecha_nacimiento: '2008-02-20',
      estado: 'activo'
    }, { transaction: t });

    const passwordHash = await bcrypt.hash('cliente123', 10);
    await Usuario.create({
      id: usuarioId,
      cliente_id: nuevoCliente.id,
      rol_id: 2, // usuario
      username: '605100869', // Cédula como username
      password_hash: passwordHash,
      estado: 'activo'
    }, { transaction: t });

    await t.commit();
    console.log('Transformación completada con éxito.');
    process.exit(0);
  } catch (err) {
    await t.rollback();
    console.error('Error durante la transformación:', err);
    process.exit(1);
  }
}

transformUser();
