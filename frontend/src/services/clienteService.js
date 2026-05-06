import api from './api';

export const clienteService = {
  listar: async () => {
    const response = await api.get('/clientes');
    return response.data;
  },
  obtener: async (id) => {
    const response = await api.get(`/clientes/${id}`);
    return response.data;
  },
  crear: async (datos) => {
    const response = await api.post('/clientes', datos);
    return response.data;
  },
  actualizar: async (id, datos) => {
    const response = await api.put(`/clientes/${id}`, datos);
    return response.data;
  },
  cambiarEstado: async (id, estado) => {
    const response = await api.patch(`/clientes/${id}/estado`, { estado });
    return response.data;
  }
};
