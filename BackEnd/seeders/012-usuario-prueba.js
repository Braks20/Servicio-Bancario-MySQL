'use strict';
const bcrypt = require('bcrypt');

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Obtener los roles creados en el seeder anterior
    const roles = await queryInterface.sequelize.query(
      `SELECT id, nombre FROM Roles;`
    );
    const rolesRows = roles[0];
    
    const rolAdmin = rolesRows.find(r => r.nombre === 'admin');
    const rolCliente = rolesRows.find(r => r.nombre === 'usuario');

    if (!rolAdmin || !rolCliente) {
      console.warn('Advertencia: Los roles no existen. Ejecuta primero 011-roles-iniciales.js');
      return;
    }

    // 2. Crear un Cliente de prueba (para vincularle un usuario cliente)
    await queryInterface.bulkInsert('Clientes', [
      {
        nombre: 'Juan',
        apellido: 'Pérez',
        dpi: '1234567890101',
        email: 'juan@cliente.com',
        telefono: '55551234',
        fecha_nacimiento: '1990-05-15',
        estado: 'activo',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    const clienteReq = await queryInterface.sequelize.query(`SELECT id FROM Clientes WHERE dpi = '1234567890101' LIMIT 1;`);
    const clienteId = clienteReq[0][0].id;

    // 3. Crear una cuenta base para Juan
    await queryInterface.bulkInsert('Cuentas', [
      {
        numero_cuenta: '2098765432',
        cliente_id: clienteId,
        tipo: 'ahorro',
        moneda: 'GTQ',
        saldo: 15000.00,
        saldo_disponible: 15000.00,
        estado: 'activa',
        fecha_apertura: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // 4. Hashear las contraseñas
    const saltRounds = 10;
    const passwordAdminHash = await bcrypt.hash('admin123', saltRounds);
    const passwordClienteHash = await bcrypt.hash('cliente123', saltRounds);

    // 5. Crear los Usuarios (Admin y Cliente)
    await queryInterface.bulkInsert('Usuarios', [
      {
        cliente_id: null, // Admin interno, sin cliente
        rol_id: rolAdmin.id,
        username: 'admin',
        password_hash: passwordAdminHash,
        intentos_fallidos: 0,
        estado: 'activo',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        cliente_id: clienteId,
        rol_id: rolCliente.id,
        username: 'juanperez',
        password_hash: passwordClienteHash,
        intentos_fallidos: 0,
        estado: 'activo',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Usuarios', { username: ['admin', 'juanperez'] }, {});
    await queryInterface.bulkDelete('Cuentas', { numero_cuenta: '2098765432' }, {});
    await queryInterface.bulkDelete('Clientes', { dpi: '1234567890101' }, {});
  }
};
