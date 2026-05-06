import api from './api';

export const authService = {
  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.usuario));
    }
    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Error durante el logout en el servidor', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
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

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error("Error al parsear el usuario desde localStorage:", error);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      return null;
    }
  }
};
