'use strict';

const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

/**
 * Inicializa Sequelize con las variables del .env
 * y carga todos los modelos del sistema bancario.
 */
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host    : process.env.DB_HOST,
    port    : process.env.DB_PORT,
    dialect : process.env.DB_DIALECT,
    logging : false,
  }
);

// ─── Cargar modelos ───────────────────────────────────────────────────────────
const Role          = require('./Role')(sequelize);
const Cliente       = require('./Cliente')(sequelize);
const Usuario       = require('./Usuario')(sequelize);
const Cuenta        = require('./Cuenta')(sequelize);
const Transaccion   = require('./Transaccion')(sequelize);
const Prestamo      = require('./Prestamo')(sequelize);
const TarjetaCredito= require('./TarjetaCredito')(sequelize);
const Notificacion  = require('./Notificacion')(sequelize);
const LogAuditoria  = require('./LogAuditoria')(sequelize);

// ─── Colección de modelos ─────────────────────────────────────────────────────
const models = {
  Role,
  Cliente,
  Usuario,
  Cuenta,
  Transaccion,
  Prestamo,
  TarjetaCredito,
  Notificacion,
  LogAuditoria,
};

// ─── Registrar asociaciones ───────────────────────────────────────────────────
Object.values(models).forEach((model) => {
  if (typeof model.associate === 'function') {
    model.associate(models);
  }
});

// ─── Exportar ─────────────────────────────────────────────────────────────────
module.exports = { sequelize, ...models };
