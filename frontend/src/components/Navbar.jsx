import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';
import '../styles/Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <header className="navbar-container">
      <div className="navbar-title">
        {/* Aquí podría ir un breadcrumb o título dinámico */}
      </div>
      
      <div className="navbar-user">
        <div className="user-info">
          <span className="user-name">{user.nombre} {user.apellido}</span>
          <span className="user-role">{user.rol}</span>
        </div>
        <div className="avatar">
          {user.nombre?.charAt(0) || <User size={20} />}
        </div>
        <button onClick={handleLogout} className="logout-btn" title="Cerrar sesión">
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
