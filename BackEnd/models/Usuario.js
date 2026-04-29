'use strict';
const { Model, DataTypes } = require('sequelize');

/**
 * Modelo: Usuario
 * Credenciales de acceso al sistema. Vinculado a un Cliente y un Rol.
 * Incluye protección contra fuerza bruta (intentos_fallidos, bloqueado_hasta).
 */
module.exports = (sequelize) => {
  class Usuario extends Model {
    static associate(models) {
      // Un usuario pertenece a un rol
      Usuario.belongsTo(models.Role, {
        foreignKey: 'rol_id',
        as: 'rol',
      });
      // Un usuario pertenece a un cliente (puede ser null para usuarios internos)
      Usuario.belongsTo(models.Cliente, {
        foreignKey: 'cliente_id',
        as: 'cliente',
      });
      // Un usuario puede ejecutar muchas transacciones
      Usuario.hasMany(models.Transaccion, {
        foreignKey: 'usuario_id',
        as: 'transacciones',
      });
      // Un usuario genera muchos registros de auditoría
      Usuario.hasMany(models.LogAuditoria, {
        foreignKey: 'usuario_id',
        as: 'logs',
      });
    }
  }

  Usuario.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      cliente_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      rol_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      username: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      ultimo_acceso: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      intentos_fallidos: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      bloqueado_hasta: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      estado: {
        type: DataTypes.ENUM('activo', 'inactivo'),
        allowNull: false,
        defaultValue: 'activo',
      },
    },
    {
      sequelize,
      modelName: 'Usuario',
      tableName: 'Usuarios',
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return Usuario;
};
