'use strict';
const { Model, DataTypes } = require('sequelize');

/**
 * Modelo: Role
 * Representa los roles del sistema (admin, usuario, cajero, etc.)
 * Se usa tabla en lugar de ENUM para permitir agregar roles sin alterar el schema.
 */
module.exports = (sequelize) => {
  class Role extends Model {
    static associate(models) {
      // Un rol puede tener muchos usuarios
      Role.hasMany(models.Usuario, {
        foreignKey: 'rol_id',
        as: 'usuarios',
      });
    }
  }

  Role.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      nombre: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      descripcion: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Role',
      tableName: 'Roles',
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return Role;
};
