import api from './api';

export const solicitudService = {
  crear: async (datos) => {
    const response = await api.post('/solicitudes', datos);
    return response.data;
  },
  listar: async () => {
    const response = await api.get('/solicitudes');
    return response.data;
  },
  procesar: async (id, estado, motivo_rechazo) => {
    const response = await api.patch(`/solicitudes/${id}/procesar`, { estado, motivo_rechazo });
    return response.data;
  }
};
