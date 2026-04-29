'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('Roles', [
      {
        nombre: 'admin',
        descripcion: 'Administrador del sistema con acceso total',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        nombre: 'usuario',
        descripcion: 'Cliente del banco con acceso a sus propias cuentas',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('Roles', { nombre: ['admin', 'usuario'] });
  },
};
