import React, { useContext } from 'react';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, Users, CreditCard, Send, LogOut, Shield, ChevronRight } from 'lucide-react';

const Layout = () => {
  const { usuario, logout } = useContext(AuthContext);
  const location = useLocation();

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  const menuItems = [
    { path: '/', icon: <LayoutDashboard size={20} />, label: 'Resumen' },
    { path: '/transferencias', icon: <Send size={20} />, label: 'Transferencias' },
    { path: '/cuentas', icon: <CreditCard size={20} />, label: 'Cuentas y Tarjetas' },
  ];

  if (usuario.rol === 'admin' || usuario.rol === 'cajero') {
    menuItems.push({ path: '/clientes', icon: <Users size={20} />, label: 'Clientes' });
  }

  if (usuario.rol === 'admin') {
    menuItems.push({ path: '/auditoria', icon: <Shield size={20} />, label: 'Auditoría' });
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar Lateral */}
      <aside className="glass" style={{
        width: '260px',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        zIndex: 10
      }}>
        <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '40px', height: '40px', 
            borderRadius: '12px', background: 'var(--accent)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 'bold', fontSize: '1.2rem'
          }}>
            B
          </div>
          <div>
            <h2 className="text-h3" style={{ marginBottom: 0 }}>Nexus Bank</h2>
            <p className="text-xs text-muted">Banca Premium</p>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '20px 12px' }}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || 
                            (item.path !== '/' && location.pathname.startsWith(item.path));
            
            return (
              <Link 
                key={item.path} 
                to={item.path}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-sm)',
                  color: isActive ? 'var(--accent)' : 'var(--text-main)',
                  background: isActive ? 'rgba(52, 152, 219, 0.1)' : 'transparent',
                  textDecoration: 'none',
                  fontWeight: isActive ? '600' : '500',
                  marginBottom: '4px',
                  transition: 'var(--transition)'
                }}
              >
                {item.icon}
                <span>{item.label}</span>
                {isActive && <ChevronRight size={16} style={{ marginLeft: 'auto' }} />}
              </Link>
            )
          })}
        </nav>

        <div style={{ padding: '24px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%',
              background: 'var(--primary-light)', display: 'flex', 
              alignItems: 'center', justifyContent: 'center', color: 'white'
            }}>
              {usuario.username.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <p style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-main)' }}>@{usuario.username}</p>
              <p className="badge badge-info" style={{ display: 'inline-block' }}>{usuario.rol}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="btn btn-outline"
            style={{ width: '100%', padding: '8px', fontSize: '0.9rem', color: 'var(--danger)', borderColor: 'var(--danger)' }}
          >
            <LogOut size={16} /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main style={{ flex: 1, marginLeft: '260px', padding: '32px 40px' }}>
        <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
