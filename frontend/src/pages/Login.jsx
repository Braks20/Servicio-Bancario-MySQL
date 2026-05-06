import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import '../styles/Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(username, password);
      navigate('/dashboard'); // Redirigir al dashboard después del login exitoso
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo-container">
            <Building2 size={40} className="logo-icon" />
          </div>
          <h1>Servicio Bancario</h1>
          <p>Bienvenido de vuelta. Ingresa a tu cuenta.</p>
        </div>

        {error && (
          <div className="glass-panel-error">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label htmlFor="username">Nombre de Usuario</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={20} />
              <input
                type="text"
                id="username"
                placeholder="Nombre de usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="password">Contraseña</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={20} />
              <input
                type="password"
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-actions">
            <a href="#" className="forgot-password">¿Olvidaste tu contraseña?</a>
          </div>

          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? 'Verificando...' : (
              <>
                <LogIn size={20} />
                <span>Ingresar</span>
              </>
            )}
          </button>
        </form>
      </div>
      
      {/* Elementos decorativos de fondo */}
      <div className="bg-circle circle-1"></div>
      <div className="bg-circle circle-2"></div>
    </div>
  );
};

export default Login;
