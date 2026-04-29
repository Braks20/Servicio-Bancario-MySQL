'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Cuentas', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      numero_cuenta: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true,
      },
      cliente_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Clientes', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      tipo: {
        type: Sequelize.ENUM('ahorro', 'corriente', 'plazo_fijo', 'empresarial'),
        allowNull: false,
      },
      moneda: {
        type: Sequelize.ENUM('GTQ', 'USD', 'EUR'),
        allowNull: false,
        defaultValue: 'GTQ',
      },
      saldo: {
        type: Sequelize.DECIMAL(18, 2),
        allowNull: false,
        defaultValue: 0.00,
      },
      saldo_disponible: {
        type: Sequelize.DECIMAL(18, 2),
        allowNull: false,
        defaultValue: 0.00,
      },
      estado: {
        type: Sequelize.ENUM('activa', 'inactiva', 'congelada', 'cerrada'),
        allowNull: false,
        defaultValue: 'activa',
      },
      fecha_apertura: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Cuentas');
  },
};
