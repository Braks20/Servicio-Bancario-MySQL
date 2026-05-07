import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const statsService = {
  getDashboardStats: async () => {
    try {
      const response = await axios.get(`${API_URL}/stats/dashboard`, { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error("Error al obtener estadísticas", error);
      throw error;
    }
  }
};
