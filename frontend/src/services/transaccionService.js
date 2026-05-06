import api from './api';

export const transaccionService = {
  listar: async () => {
    const response = await api.get('/transacciones');
    return response.data;
  },
  obtener: async (id) => {
    const response = await api.get(`/transacciones/${id}`);
    return response.data;
  },
  deposito: async (datos) => {
    const response = await api.post('/transacciones/deposito', datos);
    return response.data;
  },
  retiro: async (datos) => {
    const response = await api.post('/transacciones/retiro', datos);
    return response.data;
  },
  transferencia: async (datos) => {
    const response = await api.post('/transacciones/transferencia', datos);
    return response.data;
  },
  revertir: async (id) => {
    const response = await api.post(`/transacciones/${id}/revertir`);
    return response.data;
  }
};
