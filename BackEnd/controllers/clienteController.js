const { Cliente, Cuenta, Prestamo, TarjetaCredito, Sequelize } = require('../models');
const { registrarAuditoria } = require('../middlewares/auditoria');
const { Op } = Sequelize;

const clienteController = {
  // GET /api/clientes
  listar: async (req, res) => {
    try {
      const { estado, nombre, page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      let whereClause = {};
      if (estado) whereClause.estado = estado;
      if (nombre) {
        whereClause[Op.or] = [
          { nombre: { [Op.like]: `%${nombre}%` } },
          { apellido: { [Op.like]: `%${nombre}%` } }
        ];
      }

      const { count, rows: clientes } = await Cliente.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']]
      });

      return res.status(200).json({
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit),
        data: clientes
      });
    } catch (error) {
      console.error('Error al listar clientes:', error);
      return res.status(500).json({ error: 'Error interno del servidor.' });
    }
  },

  // GET /api/clientes/:id
  obtener: async (req, res) => {
    try {
      const { id } = req.params;
      const cliente = await Cliente.findByPk(id, {
        include: [
          { model: Cuenta, as: 'cuentas' },
          { model: Prestamo, as: 'prestamos' },
          { model: TarjetaCredito, as: 'tarjetas' }
        ]
      });

      if (!cliente) {
        return res.status(404).json({ error: 'Cliente no encontrado.' });
      }

      return res.status(200).json(cliente);
    } catch (error) {
      console.error('Error al obtener cliente:', error);
      return res.status(500).json({ error: 'Error interno del servidor.' });
    }
  },

  // POST /api/clientes
  crear: async (req, res) => {
    try {
      const { nombre, apellido, dpi, email, telefono, fecha_nacimiento, direccion } = req.body;

      // Validación simple
      if (!nombre || !apellido || !dpi || !email) {
        return res.status(400).json({ error: 'Nombre, apellido, DPI y correo electrónico son obligatorios.' });
      }

      // Validar duplicados
      const existeDpi = await Cliente.findOne({ where: { dpi } });
      if (existeDpi) {
        return res.status(400).json({ error: 'El DPI ya está registrado.' });
      }

      const existeEmail = await Cliente.findOne({ where: { email } });
      if (existeEmail) {
        return res.status(400).json({ error: 'El correo electrónico ya está registrado.' });
      }

      const nuevoCliente = await Cliente.create({
        nombre,
        apellido,
        dpi,
        email,
        telefono,
        fecha_nacimiento,
        direccion,
        estado: 'activo'
      });

      await registrarAuditoria(req, 'CREAR_CLIENTE', 'Clientes', nuevoCliente.id, null, nuevoCliente.toJSON());

      return res.status(201).json({ mensaje: 'Cliente creado exitosamente.', cliente: nuevoCliente });
    } catch (error) {
      console.error('Error al crear cliente:', error);
      return res.status(500).json({ error: 'Error interno del servidor.' });
    }
  },

  // PUT /api/clientes/:id
  actualizar: async (req, res) => {
    try {
      const { id } = req.params;
      const datosActualizar = req.body;

      // Evitar que actualicen campos que no deben
      delete datosActualizar.id;
      delete datosActualizar.estado; // El estado se cambia por un endpoint separado

      const cliente = await Cliente.findByPk(id);
      if (!cliente) {
        return res.status(404).json({ error: 'Cliente no encontrado.' });
      }

      // Si se actualiza el email, verificar que no esté en uso
      if (datosActualizar.email && datosActualizar.email !== cliente.email) {
        const existeEmail = await Cliente.findOne({ where: { email: datosActualizar.email } });
        if (existeEmail) {
          return res.status(400).json({ error: 'El correo electrónico ya está registrado por otro cliente.' });
        }
      }

      // Guardar estado anterior para auditoría
      const datosAnteriores = cliente.toJSON();

      await cliente.update(datosActualizar);

      await registrarAuditoria(req, 'ACTUALIZAR_CLIENTE', 'Clientes', cliente.id, datosAnteriores, cliente.toJSON());

      return res.status(200).json({ mensaje: 'Cliente actualizado exitosamente.', cliente });
    } catch (error) {
      console.error('Error al actualizar cliente:', error);
      return res.status(500).json({ error: 'Error interno del servidor.' });
    }
  },

  // PATCH /api/clientes/:id/estado
  cambiarEstado: async (req, res) => {
    try {
      const { id } = req.params;
      const { estado } = req.body;

      if (!['activo', 'inactivo', 'bloqueado'].includes(estado)) {
        return res.status(400).json({ error: 'Estado no válido. Debe ser activo, inactivo o bloqueado.' });
      }

      const cliente = await Cliente.findByPk(id);
      if (!cliente) {
        return res.status(404).json({ error: 'Cliente no encontrado.' });
      }

      const datosAnteriores = cliente.toJSON();

      cliente.estado = estado;
      await cliente.save();

      await registrarAuditoria(req, 'CAMBIO_ESTADO_CLIENTE', 'Clientes', cliente.id, datosAnteriores, cliente.toJSON());

      return res.status(200).json({ mensaje: `Estado del cliente cambiado a ${estado}.`, cliente });
    } catch (error) {
      console.error('Error al cambiar estado del cliente:', error);
      return res.status(500).json({ error: 'Error interno del servidor.' });
    }
  }
};

module.exports = clienteController;
