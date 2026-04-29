'use strict';
const { Model, DataTypes } = require('sequelize');

/**
 * Modelo: Cliente
 * Identidad central del sistema. Representa a cada cliente del banco.
 */
module.exports = (sequelize) => {
  class Cliente extends Model {
    static associate(models) {
      // Un cliente puede tener muchas cuentas
      Cliente.hasMany(models.Cuenta, {
        foreignKey: 'cliente_id',
        as: 'cuentas',
      });
      // Un cliente puede tener muchos usuarios (accesos)
      Cliente.hasMany(models.Usuario, {
        foreignKey: 'cliente_id',
        as: 'usuarios',
      });
      // Un cliente puede tener muchos préstamos
      Cliente.hasMany(models.Prestamo, {
        foreignKey: 'cliente_id',
        as: 'prestamos',
      });
      // Un cliente puede tener muchas tarjetas de crédito
      Cliente.hasMany(models.TarjetaCredito, {
        foreignKey: 'cliente_id',
        as: 'tarjetas',
      });
      // Un cliente puede recibir muchas notificaciones
      Cliente.hasMany(models.Notificacion, {
        foreignKey: 'cliente_id',
        as: 'notificaciones',
      });
    }
  }

  Cliente.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      apellido: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      dpi: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
      },
      email: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: true,
      },
      telefono: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      fecha_nacimiento: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      direccion: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      estado: {
        type: DataTypes.ENUM('activo', 'inactivo', 'bloqueado'),
        allowNull: false,
        defaultValue: 'activo',
      },
    },
    {
      sequelize,
      modelName: 'Cliente',
      tableName: 'Clientes',
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return Cliente;
};
