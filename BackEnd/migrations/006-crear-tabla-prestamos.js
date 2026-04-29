'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Prestamos', {
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
      cuenta_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Cuentas', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      monto_aprobado: {
        type: Sequelize.DECIMAL(18, 2),
        allowNull: false,
      },
      monto_pendiente: {
        type: Sequelize.DECIMAL(18, 2),
        allowNull: false,
      },
      tasa_interes: {
        type: Sequelize.DECIMAL(5, 4),
        allowNull: false,
      },
      plazo_meses: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      cuota_mensual: {
        type: Sequelize.DECIMAL(18, 2),
        allowNull: false,
      },
      estado: {
        type: Sequelize.ENUM('solicitado', 'aprobado', 'activo', 'pagado', 'mora', 'rechazado'),
        allowNull: false,
        defaultValue: 'solicitado',
      },
      fecha_aprobacion: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      fecha_vencimiento: {
        type: Sequelize.DATEONLY,
        allowNull: true,
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
    await queryInterface.dropTable('Prestamos');
  },
};
