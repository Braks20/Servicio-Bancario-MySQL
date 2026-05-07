'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class SolicitudCuenta extends Model {
    static associate(models) {
      SolicitudCuenta.belongsTo(models.Cliente, {
        foreignKey: 'cliente_id',
        as: 'cliente',
      });
    }
  }

  SolicitudCuenta.init(
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
      tipo_cuenta: {
        type: DataTypes.ENUM('ahorro', 'corriente', 'plazo_fijo', 'empresarial'),
        allowNull: false,
      },
      moneda: {
        type: DataTypes.ENUM('GTQ', 'USD', 'EUR'),
        allowNull: false,
        defaultValue: 'GTQ',
      },
      estado: {
        type: DataTypes.ENUM('pendiente', 'aprobada', 'denegada'),
        allowNull: false,
        defaultValue: 'pendiente',
      },
      motivo_rechazo: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      observaciones: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'SolicitudCuenta',
      tableName: 'SolicitudesCuentas',
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return SolicitudCuenta;
};
