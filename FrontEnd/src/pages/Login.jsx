import React, { useState, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Shield, Lock, User, ArrowRight } from 'lucide-react';

const Login = () => {
  const { login, usuario, cargando } = useContext(AuthContext);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  if (usuario) {
    return <Navigate to="/" replace />;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      setError('Por favor, ingresa tus credenciales.');
      return;
    }

    const result = await login(formData.username, formData.password);
    if (!result.success) {
      setError(result.error);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: 'linear-gradient(135deg, var(--bg-body) 0%, #E2E8F0 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Elementos decorativos */}
      <div style={{
        position: 'absolute', width: '600px', height: '600px', 
        borderRadius: '50%', background: 'rgba(52, 152, 219, 0.05)', 
        top: '-100px', left: '-100px', filter: 'blur(40px)'
      }}></div>
      <div style={{
        position: 'absolute', width: '400px', height: '400px', 
        borderRadius: '50%', background: 'rgba(46, 204, 113, 0.05)', 
        bottom: '-50px', right: '-50px', filter: 'blur(40px)'
      }}></div>

      <div className="card glass animate-fade-in" style={{
        width: '100%',
        maxWidth: '440px',
        position: 'relative',
        zIndex: 1,
        padding: '40px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ 
            width: '64px', height: '64px', 
            borderRadius: '16px', background: 'var(--accent)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', margin: '0 auto 16px',
            boxShadow: '0 8px 24px rgba(52, 152, 219, 0.3)'
          }}>
            <Shield size={32} />
          </div>
          <h1 className="text-h2" style={{ color: 'var(--primary)', marginBottom: '8px' }}>Nexus Bank</h1>
          <p className="text-muted">Ingresa a tu banca premium</p>
        </div>

        {error && (
          <div className="badge-danger" style={{ 
            padding: '12px 16px', borderRadius: '8px', 
            marginBottom: '24px', fontSize: '0.9rem',
            border: '1px solid rgba(231, 76, 60, 0.2)',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--danger)' }}></div>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label" htmlFor="username">Usuario</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
              <input 
                type="text" 
                id="username"
                name="username"
                className="input-field" 
                placeholder="ej: admin o juanperez"
                style={{ paddingLeft: '44px' }}
                value={formData.username}
                onChange={handleChange}
                disabled={cargando}
              />
            </div>
          </div>

          <div className="input-group" style={{ marginBottom: '32px' }}>
            <label className="input-label" htmlFor="password">Contraseña</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
              <input 
                type="password" 
                id="password"
                name="password"
                className="input-field" 
                placeholder="••••••••"
                style={{ paddingLeft: '44px' }}
                value={formData.password}
                onChange={handleChange}
                disabled={cargando}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '14px' }}
            disabled={cargando}
          >
            {cargando ? 'Verificando...' : 'Acceder a mi cuenta'}
            {!cargando && <ArrowRight size={18} />}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <p className="text-xs text-muted">
            ¿Necesitas ayuda? <a href="#" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: '500' }}>Contactar soporte</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
