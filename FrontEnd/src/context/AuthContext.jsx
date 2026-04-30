import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('banco_token') || null);
  const [usuario, setUsuario] = useState(JSON.parse(localStorage.getItem('banco_usuario')) || null);
  const [cargando, setCargando] = useState(false);

  const login = async (username, password) => {
    setCargando(true);
    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al iniciar sesión');
      }

      setToken(data.token);
      setUsuario(data.usuario);
      localStorage.setItem('banco_token', data.token);
      localStorage.setItem('banco_usuario', JSON.stringify(data.usuario));
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setCargando(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUsuario(null);
    localStorage.removeItem('banco_token');
    localStorage.removeItem('banco_usuario');
  };

  // Helper para hacer peticiones autenticadas
  const authFetch = async (url, options = {}) => {
    if (!token) throw new Error('No hay sesión activa');
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers
    };

    const response = await fetch(`http://localhost:3000/api${url}`, {
      ...options,
      headers
    });

    if (response.status === 401 || response.status === 403) {
      logout();
      window.location.href = '/login';
    }

    return response;
  };

  return (
    <AuthContext.Provider value={{ token, usuario, cargando, login, logout, authFetch }}>
      {children}
    </AuthContext.Provider>
  );
};
