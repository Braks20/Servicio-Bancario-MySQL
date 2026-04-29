'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Transacciones', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      uuid: {
        type: Sequelize.STRING(36),
        allowNull: false,
        unique: true,
      },
      cuenta_origen: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'Cuentas', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      cuenta_destino: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'Cuentas', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      tipo: {
        type: Sequelize.ENUM('deposito', 'retiro', 'transferencia', 'pago', 'ajuste'),
        allowNull: false,
      },
      monto: {
        type: Sequelize.DECIMAL(18, 2),
        allowNull: false,
      },
      moneda: {
        type: Sequelize.ENUM('GTQ', 'USD', 'EUR'),
        allowNull: false,
        defaultValue: 'GTQ',
      },
      descripcion: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      referencia: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      estado: {
        type: Sequelize.ENUM('pendiente', 'completada', 'revertida', 'fallida'),
        allowNull: false,
        defaultValue: 'pendiente',
      },
      canal: {
        type: Sequelize.ENUM('app', 'web', 'cajero', 'sucursal', 'api'),
        allowNull: false,
        defaultValue: 'web',
      },
      ip_origen: {
        type: Sequelize.STRING(45),
        allowNull: true,
      },
      usuario_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'Usuarios', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
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
    await queryInterface.dropTable('Transacciones');
  },
};
