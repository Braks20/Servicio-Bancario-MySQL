import api from './api';

export const auditoriaService = {
  listar: async () => {
    const response = await api.get('/auditoria');
    return response.data;
  },
  obtener: async (id) => {
    const response = await api.get(`/auditoria/${id}`);
    return response.data;
  }
};

export const usuarioService = {
  desbloquear: async (id) => {
    const response = await api.post(`/usuarios/${id}/desbloquear`);
    return response.data;
  }
};
