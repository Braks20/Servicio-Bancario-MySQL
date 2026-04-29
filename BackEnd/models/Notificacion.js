'use strict';
const { Model, DataTypes } = require('sequelize');

/**
 * Modelo: Notificacion
 * Mensajes enviados al cliente a través de diferentes canales (email, SMS, push).
 * Puede estar vinculada a una transacción específica.
 */
module.exports = (sequelize) => {
  class Notificacion extends Model {
    static associate(models) {
      // Una notificación pertenece a un cliente
      Notificacion.belongsTo(models.Cliente, {
        foreignKey: 'cliente_id',
        as: 'cliente',
      });
      // Una notificación puede estar vinculada a una transacción
      Notificacion.belongsTo(models.Transaccion, {
        foreignKey: 'transaccion_id',
        as: 'transaccion',
      });
    }
  }

  Notificacion.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      cliente_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      tipo: {
        type: DataTypes.ENUM('email', 'sms', 'push'),
        allowNull: false,
      },
      titulo: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      mensaje: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      leida: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      enviada: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      transaccion_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Notificacion',
      tableName: 'Notificaciones',
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return Notificacion;
};
