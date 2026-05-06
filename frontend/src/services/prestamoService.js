import api from './api';

export const prestamoService = {
  listar: async () => {
    const response = await api.get('/prestamos');
    return response.data;
  },
  obtener: async (id) => {
    const response = await api.get(`/prestamos/${id}`);
    return response.data;
  },
  solicitar: async (datos) => {
    const response = await api.post('/prestamos', datos);
    return response.data;
  },
  aprobar: async (id) => {
    const response = await api.patch(`/prestamos/${id}/aprobar`);
    return response.data;
  },
  activar: async (id) => {
    const response = await api.patch(`/prestamos/${id}/activar`);
    return response.data;
  },
  pagarCuota: async (id, datos) => {
    const response = await api.post(`/prestamos/${id}/pagar`, datos);
    return response.data;
  }
};
