import api from './api';

export const cuentaService = {
  listar: async () => {
    const response = await api.get('/cuentas');
    return response.data;
  },
  obtener: async (id) => {
    const response = await api.get(`/cuentas/${id}`);
    return response.data;
  },
  consultarSaldo: async (id) => {
    const response = await api.get(`/cuentas/${id}/saldo`);
    return response.data;
  },
  crear: async (datos) => {
    const response = await api.post('/cuentas', datos);
    return response.data;
  },
  actualizarEstado: async (id, estado) => {
    const response = await api.patch(`/cuentas/${id}/estado`, { estado });
    return response.data;
  }
};
