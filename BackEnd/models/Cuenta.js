'use strict';
const { Model, DataTypes } = require('sequelize');

/**
 * Modelo: Cuenta
 * Cuenta bancaria de un cliente. Soporta múltiples tipos y monedas.
 */
module.exports = (sequelize) => {
  class Cuenta extends Model {
    static associate(models) {
      // Una cuenta pertenece a un cliente
      Cuenta.belongsTo(models.Cliente, {
        foreignKey: 'cliente_id',
        as: 'cliente',
      });
      // Una cuenta puede ser origen de muchas transacciones
      Cuenta.hasMany(models.Transaccion, {
        foreignKey: 'cuenta_origen',
        as: 'transacciones_enviadas',
      });
      // Una cuenta puede ser destino de muchas transacciones
      Cuenta.hasMany(models.Transaccion, {
        foreignKey: 'cuenta_destino',
        as: 'transacciones_recibidas',
      });
      // Una cuenta puede tener muchos préstamos asociados
      Cuenta.hasMany(models.Prestamo, {
        foreignKey: 'cuenta_id',
        as: 'prestamos',
      });
    }
  }

  Cuenta.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      numero_cuenta: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
      },
      cliente_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      tipo: {
        type: DataTypes.ENUM('ahorro', 'corriente', 'plazo_fijo', 'empresarial'),
        allowNull: false,
      },
      moneda: {
        type: DataTypes.ENUM('GTQ', 'USD', 'EUR'),
        allowNull: false,
        defaultValue: 'GTQ',
      },
      saldo: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: false,
        defaultValue: 0.00,
      },
      saldo_disponible: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: false,
        defaultValue: 0.00,
      },
      estado: {
        type: DataTypes.ENUM('activa', 'inactiva', 'congelada', 'cerrada'),
        allowNull: false,
        defaultValue: 'activa',
      },
      fecha_apertura: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: 'Cuenta',
      tableName: 'Cuentas',
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return Cuenta;
};
