'use strict';
const { Model, DataTypes } = require('sequelize');

/**
 * Modelo: TarjetaCredito
 * Tarjeta de crédito vinculada a un cliente.
 * El número de tarjeta se almacena como string (puede tokenizarse en producción).
 */
module.exports = (sequelize) => {
  class TarjetaCredito extends Model {
    static associate(models) {
      // Una tarjeta pertenece a un cliente
      TarjetaCredito.belongsTo(models.Cliente, {
        foreignKey: 'cliente_id',
        as: 'cliente',
      });
    }
  }

  TarjetaCredito.init(
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
      numero_tarjeta: {
        type: DataTypes.STRING(19),
        allowNull: false,
        unique: true,
      },
      limite_credito: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: false,
      },
      saldo_utilizado: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: false,
        defaultValue: 0.00,
      },
      fecha_corte: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Día del mes (1-31)',
      },
      fecha_pago: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Día del mes (1-31)',
      },
      estado: {
        type: DataTypes.ENUM('activa', 'bloqueada', 'cancelada'),
        allowNull: false,
        defaultValue: 'activa',
      },
    },
    {
      sequelize,
      modelName: 'TarjetaCredito',
      tableName: 'TarjetasCredito',
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return TarjetaCredito;
};
