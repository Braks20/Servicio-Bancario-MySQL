import axios from 'axios';

// Configuración base de la API
const api = axios.create({
  baseURL: 'http://localhost:3000/api', // Ajustar si es necesario
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para inyectar el token JWT en las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores globalmente (ej. token expirado)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Si recibimos 401 Unauthorized, limpiamos sesión y redirigimos
      // a menos que estemos en la ruta de login
      if (window.location.pathname !== '/login') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
