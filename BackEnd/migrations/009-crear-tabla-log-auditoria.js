'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('LogAuditoria', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      usuario_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'Usuarios', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      accion: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      tabla_afectada: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      registro_id: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
      datos_anteriores: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      datos_nuevos: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      ip: {
        type: Sequelize.STRING(45),
        allowNull: true,
      },
      user_agent: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('LogAuditoria');
  },
};
