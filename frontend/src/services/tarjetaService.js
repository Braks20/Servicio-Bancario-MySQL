import api from './api';

export const tarjetaService = {
  listar: async () => {
    const response = await api.get('/tarjetas');
    return response.data;
  },
  obtener: async (id) => {
    const response = await api.get(`/tarjetas/${id}`);
    return response.data;
  },
  crear: async (datos) => {
    const response = await api.post('/tarjetas', datos);
    return response.data;
  },
  actualizarEstado: async (id, estado) => {
    const response = await api.patch(`/tarjetas/${id}/estado`, { estado });
    return response.data;
  },
  pagarSaldo: async (id, datos) => {
    const response = await api.post(`/tarjetas/${id}/pagar`, datos);
    return response.data;
  }
};
