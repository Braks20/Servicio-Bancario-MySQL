'use strict';

module.exports = {
  async up(queryInterface) {
    // Clientes
    await queryInterface.addIndex('Clientes', ['email'], { name: 'idx_clientes_email' });
    await queryInterface.addIndex('Clientes', ['dpi'],   { name: 'idx_clientes_dpi' });
    await queryInterface.addIndex('Clientes', ['estado'],{ name: 'idx_clientes_estado' });

    // Usuarios
    await queryInterface.addIndex('Usuarios', ['username'],  { name: 'idx_usuarios_username' });
    await queryInterface.addIndex('Usuarios', ['cliente_id'],{ name: 'idx_usuarios_cliente' });
    await queryInterface.addIndex('Usuarios', ['rol_id'],    { name: 'idx_usuarios_rol' });

    // Cuentas
    await queryInterface.addIndex('Cuentas', ['numero_cuenta'], { name: 'idx_cuentas_numero' });
    await queryInterface.addIndex('Cuentas', ['cliente_id'],    { name: 'idx_cuentas_cliente' });
    await queryInterface.addIndex('Cuentas', ['estado'],        { name: 'idx_cuentas_estado' });

    // Transacciones
    await queryInterface.addIndex('Transacciones', ['cuenta_origen'],  { name: 'idx_trans_origen' });
    await queryInterface.addIndex('Transacciones', ['cuenta_destino'], { name: 'idx_trans_destino' });
    await queryInterface.addIndex('Transacciones', ['usuario_id'],     { name: 'idx_trans_usuario' });
    await queryInterface.addIndex('Transacciones', ['estado'],         { name: 'idx_trans_estado' });
    await queryInterface.addIndex('Transacciones', ['created_at'],     { name: 'idx_trans_fecha' });
    await queryInterface.addIndex('Transacciones', ['cuenta_origen', 'created_at'], { name: 'idx_trans_origen_fecha' });

    // Notificaciones
    await queryInterface.addIndex('Notificaciones', ['cliente_id'], { name: 'idx_noti_cliente' });
    await queryInterface.addIndex('Notificaciones', ['leida'],      { name: 'idx_noti_leida' });

    // LogAuditoria
    await queryInterface.addIndex('LogAuditoria', ['usuario_id'],     { name: 'idx_log_usuario' });
    await queryInterface.addIndex('LogAuditoria', ['tabla_afectada'], { name: 'idx_log_tabla' });
    await queryInterface.addIndex('LogAuditoria', ['created_at'],     { name: 'idx_log_fecha' });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('Clientes',      'idx_clientes_email');
    await queryInterface.removeIndex('Clientes',      'idx_clientes_dpi');
    await queryInterface.removeIndex('Clientes',      'idx_clientes_estado');
    await queryInterface.removeIndex('Usuarios',      'idx_usuarios_username');
    await queryInterface.removeIndex('Usuarios',      'idx_usuarios_cliente');
    await queryInterface.removeIndex('Usuarios',      'idx_usuarios_rol');
    await queryInterface.removeIndex('Cuentas',       'idx_cuentas_numero');
    await queryInterface.removeIndex('Cuentas',       'idx_cuentas_cliente');
    await queryInterface.removeIndex('Cuentas',       'idx_cuentas_estado');
    await queryInterface.removeIndex('Transacciones', 'idx_trans_origen');
    await queryInterface.removeIndex('Transacciones', 'idx_trans_destino');
    await queryInterface.removeIndex('Transacciones', 'idx_trans_usuario');
    await queryInterface.removeIndex('Transacciones', 'idx_trans_estado');
    await queryInterface.removeIndex('Transacciones', 'idx_trans_fecha');
    await queryInterface.removeIndex('Transacciones', 'idx_trans_origen_fecha');
    await queryInterface.removeIndex('Notificaciones','idx_noti_cliente');
    await queryInterface.removeIndex('Notificaciones','idx_noti_leida');
    await queryInterface.removeIndex('LogAuditoria',  'idx_log_usuario');
    await queryInterface.removeIndex('LogAuditoria',  'idx_log_tabla');
    await queryInterface.removeIndex('LogAuditoria',  'idx_log_fecha');
  },
};
