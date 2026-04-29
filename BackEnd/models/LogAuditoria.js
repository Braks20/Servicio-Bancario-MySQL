'use strict';
const { Model, DataTypes } = require('sequelize');

/**
 * Modelo: LogAuditoria
 * Registro inmutable de todas las acciones sensibles del sistema.
 * REGLA: Este modelo NO tiene updated_at. No se edita nunca.
 */
module.exports = (sequelize) => {
  class LogAuditoria extends Model {
    static associate(models) {
      // Un log pertenece al usuario que realizó la acción
      LogAuditoria.belongsTo(models.Usuario, {
        foreignKey: 'usuario_id',
        as: 'usuario',
      });
    }
  }

  LogAuditoria.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      usuario_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      accion: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Ej: LOGIN, TRANSFERENCIA, CAMBIO_CLAVE',
      },
      tabla_afectada: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      registro_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      datos_anteriores: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      datos_nuevos: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      ip: {
        type: DataTypes.STRING(45),
        allowNull: true,
      },
      user_agent: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'LogAuditoria',
      tableName: 'LogAuditoria',
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: false, // Inmutable: sin updated_at
    }
  );

  return LogAuditoria;
};
