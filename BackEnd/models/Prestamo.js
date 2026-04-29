'use strict';
const { Model, DataTypes } = require('sequelize');

/**
 * Modelo: Prestamo
 * Préstamo otorgado a un cliente con seguimiento de estado y cuotas.
 */
module.exports = (sequelize) => {
  class Prestamo extends Model {
    static associate(models) {
      // Un préstamo pertenece a un cliente
      Prestamo.belongsTo(models.Cliente, {
        foreignKey: 'cliente_id',
        as: 'cliente',
      });
      // Un préstamo se desembolsa en una cuenta
      Prestamo.belongsTo(models.Cuenta, {
        foreignKey: 'cuenta_id',
        as: 'cuenta',
      });
    }
  }

  Prestamo.init(
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
      cuenta_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      monto_aprobado: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: false,
      },
      monto_pendiente: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: false,
      },
      tasa_interes: {
        type: DataTypes.DECIMAL(5, 4),
        allowNull: false,
      },
      plazo_meses: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      cuota_mensual: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: false,
      },
      estado: {
        type: DataTypes.ENUM('solicitado', 'aprobado', 'activo', 'pagado', 'mora', 'rechazado'),
        allowNull: false,
        defaultValue: 'solicitado',
      },
      fecha_aprobacion: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      fecha_vencimiento: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Prestamo',
      tableName: 'Prestamos',
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return Prestamo;
};
