'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('TarjetasCredito', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      cliente_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Clientes', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      numero_tarjeta: {
        type: Sequelize.STRING(19),
        allowNull: false,
        unique: true,
      },
      limite_credito: {
        type: Sequelize.DECIMAL(18, 2),
        allowNull: false,
      },
      saldo_utilizado: {
        type: Sequelize.DECIMAL(18, 2),
        allowNull: false,
        defaultValue: 0.00,
      },
      fecha_corte: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Día del mes (1-31)',
      },
      fecha_pago: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Día del mes (1-31)',
      },
      estado: {
        type: Sequelize.ENUM('activa', 'bloqueada', 'cancelada'),
        allowNull: false,
        defaultValue: 'activa',
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
    await queryInterface.dropTable('TarjetasCredito');
  },
};
