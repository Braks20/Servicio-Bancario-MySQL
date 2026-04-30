const { LogAuditoria } = require('../models');

/**
 * Función helper para registrar eventos de auditoría desde los controladores.
 * No es un middleware de Express en el sentido tradicional (req, res, next),
 * sino una utilidad centralizada para mantener los controladores limpios.
 */
const registrarAuditoria = async (req, accion, tabla_afectada, registro_id = null, datos_anteriores = null, datos_nuevos = null) => {
  try {
    await LogAuditoria.create({
      usuario_id: req.usuario ? req.usuario.id : null,
      accion,
      tabla_afectada,
      registro_id,
      datos_anteriores,
      datos_nuevos,
      ip: req.ip || req.connection.remoteAddress,
      user_agent: req.headers ? req.headers['user-agent'] : null
    });
  } catch (error) {
    console.error('Error al registrar auditoría:', error);
    // Nota: Por diseño, no lanzamos el error para no interrumpir 
    // la transacción financiera principal si el log falla,
    // aunque en sistemas bancarios muy estrictos podría ser bloqueante.
  }
};

module.exports = { registrarAuditoria };
