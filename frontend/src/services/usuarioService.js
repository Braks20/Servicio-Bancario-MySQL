import api from './api';

export const usuarioService = {
  listar: async () => {
    const response = await api.get('/usuarios');
    return response.data;
  },
  cambiarEstado: async (id, estado) => {
    const response = await api.patch(`/usuarios/${id}/estado`, { estado });
    return response.data;
  },
  desbloquear: async (id) => {
    const response = await api.post(`/usuarios/${id}/desbloquear`);
    return response.data;
  }
};
