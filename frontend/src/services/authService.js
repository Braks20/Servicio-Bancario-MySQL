import api from './api';

export const authService = {
  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Error durante el logout en el servidor', error);
    }
  },

  cambiarPassword: async (passwordActual, passwordNueva) => {
    const response = await api.put('/auth/cambiar-password', {
      passwordActual,
      passwordNueva
    });
    return response.data;
  },

  getPerfil: async () => {
    const response = await api.get('/auth/perfil');
    return response.data;
  },

  checkAuth: async () => {
    try {
      const response = await api.get('/auth/check');
      return response.data.usuario;
    } catch (error) {
      return null;
    }
  }
};
