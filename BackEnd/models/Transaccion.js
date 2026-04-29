'use strict';
const { Model, DataTypes } = require('sequelize');

/**
 * Modelo: Transaccion
 * Registro inmutable de movimientos financieros.
 * REGLA: Las transacciones NUNCA se editan ni eliminan.
 * Para corregir un error se crea una nueva transacción de reversión.
 */
module.exports = (sequelize) => {
  class Transaccion extends Model {
    static associate(models) {
      // La transacción pertenece a la cuenta origen
      Transaccion.belongsTo(models.Cuenta, {
        foreignKey: 'cuenta_origen',
        as: 'origen',
      });
      // La transacción pertenece a la cuenta destino
      Transaccion.belongsTo(models.Cuenta, {
        foreignKey: 'cuenta_destino',
        as: 'destino',
      });
      // La transacción fue ejecutada por un usuario
      Transaccion.belongsTo(models.Usuario, {
        foreignKey: 'usuario_id',
        as: 'usuario',
      });
      // Una transacción puede generar notificaciones
      Transaccion.hasMany(models.Notificacion, {
        foreignKey: 'transaccion_id',
        as: 'notificaciones',
      });
    }
  }

  Transaccion.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      uuid: {
        type: DataTypes.STRING(36),
        allowNull: false,
        unique: true,
      },
      cuenta_origen: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      cuenta_destino: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      tipo: {
        type: DataTypes.ENUM('deposito', 'retiro', 'transferencia', 'pago', 'ajuste'),
        allowNull: false,
      },
      monto: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: false,
      },
      moneda: {
        type: DataTypes.ENUM('GTQ', 'USD', 'EUR'),
        allowNull: false,
        defaultValue: 'GTQ',
      },
      descripcion: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      referencia: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      estado: {
        type: DataTypes.ENUM('pendiente', 'completada', 'revertida', 'fallida'),
        allowNull: false,
        defaultValue: 'pendiente',
      },
      canal: {
        type: DataTypes.ENUM('app', 'web', 'cajero', 'sucursal', 'api'),
        allowNull: false,
        defaultValue: 'web',
      },
      ip_origen: {
        type: DataTypes.STRING(45),
        allowNull: true,
      },
      usuario_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Transaccion',
      tableName: 'Transacciones',
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return Transaccion;
};
