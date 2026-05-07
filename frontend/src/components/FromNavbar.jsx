import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Bell, Mail } from 'lucide-react';
import { notificacionService } from '../services/notificacionService';
import Swal from 'sweetalert2';
import '../styles/FromNavbar.css';

const FromNavbar = () => {
  const { user, logout } = useAuth();
  const [notificaciones, setNotificaciones] = useState([]);
  const [showNotif, setShowNotif] = useState(false);

  const fetchNotificaciones = async () => {
    if (!user || user.rol === 'admin') return;
    try {
      const data = await notificacionService.listar();
      setNotificaciones(data);
    } catch (error) {
      console.error("Error cargando notificaciones", error);
    }
  };

  useEffect(() => {
    fetchNotificaciones();
    // Polling opcional cada 30 segundos
    const interval = setInterval(fetchNotificaciones, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: '¿Cerrar sesión?',
      text: "Tendrás que volver a ingresar tus credenciales.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      await logout();
    }
  };

  const markAsRead = async (id, msg) => {
    try {
      await notificacionService.marcarLeida(id);
      Swal.fire('Notificación', msg, 'info');
      fetchNotificaciones();
    } catch (error) {
      console.error(error);
    }
  };

  const unreadCount = notificaciones.filter(n => !n.leida).length;

  if (!user) return null;

  return (
    <header className="navbar-container">
      <div className="navbar-search">
        {/* Placeholder para buscador si se requiere */}
      </div>
      
      <div className="navbar-actions">
        {user.rol !== 'admin' && (
          <div className="notification-bell" onClick={() => setShowNotif(!showNotif)} style={{ position: 'relative', cursor: 'pointer', marginRight: '1.5rem' }}>
            <Bell size={22} color="#64748b" />
            {unreadCount > 0 && (
              <span style={{ 
                position: 'absolute', 
                top: '-5px', 
                right: '-5px', 
                background: '#ef4444', 
                color: 'white', 
                borderRadius: '50%', 
                fontSize: '10px', 
                padding: '2px 5px',
                fontWeight: 'bold'
              }}>
                {unreadCount}
              </span>
            )}
            
            {showNotif && (
              <div className="notif-dropdown" style={{
                position: 'absolute',
                top: '40px',
                right: '0',
                width: '300px',
                background: 'white',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                borderRadius: '0.5rem',
                border: '1px solid #e2e8f0',
                zIndex: 1000,
                maxHeight: '400px',
                overflowY: 'auto'
              }}>
                <div style={{ padding: '1rem', borderBottom: '1px solid #f1f5f9', fontWeight: 'bold' }}>Notificaciones</div>
                {notificaciones.length > 0 ? (
                  notificaciones.map(n => (
                    <div 
                      key={n.id} 
                      onClick={() => markAsRead(n.id, n.mensaje)}
                      style={{ 
                        padding: '1rem', 
                        borderBottom: '1px solid #f1f5f9', 
                        cursor: 'pointer',
                        background: n.leida ? 'transparent' : '#f0f9ff'
                      }}
                    >
                      <div style={{ fontSize: '0.9rem', fontWeight: n.leida ? 'normal' : '600' }}>{n.titulo}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.mensaje}</div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '1rem', textAlign: 'center', color: '#64748b' }}>No tienes notificaciones</div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="navbar-user">
          <div className="user-info">
            <span className="user-name">{user.cliente ? `${user.cliente.nombre} ${user.cliente.apellido}` : user.username}</span>
            <span className="user-role">{user.rol?.toUpperCase()}</span>
          </div>
          <div className="avatar">
            {user.username?.charAt(0).toUpperCase()}
          </div>
          <button onClick={handleLogout} className="logout-btn" title="Cerrar sesión">
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default FromNavbar;
