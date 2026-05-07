import api from './api';

export const notificacionService = {
  listar: async () => {
    const response = await api.get('/notificaciones');
    return response.data;
  },
  marcarLeida: async (id) => {
    const response = await api.patch(`/notificaciones/${id}/leer`);
    return response.data;
  }
};
