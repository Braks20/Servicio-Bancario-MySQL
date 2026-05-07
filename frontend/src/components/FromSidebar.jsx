import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, CreditCard, ArrowLeftRight, FileText, Building2, User, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../styles/FromSidebar.css';

const FromSidebar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  if (!user) return null;

  return (
    <div className="sidebar-container">
      <div className="sidebar-header">
        <Building2 size={32} color="#0F172A" />
        <h2>BancoApp</h2>
      </div>

      <div className="sidebar-profile">
        <div className="avatar-sidebar">
          {user.cliente ? (
            <img src={`https://ui-avatars.com/api/?name=${user.cliente.nombre}+${user.cliente.apellido}&background=F1F5F9&color=0F172A`} alt="Avatar" />
          ) : (
            <User size={24} color="#64748B" />
          )}
        </div>
        <div className="profile-info">
          <h4>{user.cliente ? `${user.cliente.nombre} ${user.cliente.apellido}` : user.username}</h4>
          <p>Rol: {user.rol.toUpperCase()}</p>
        </div>
      </div>

      <div className="sidebar-action">
        <button className="btn-new-tx" onClick={() => navigate('/transacciones')}>
          <Plus size={20} />
          <span>Nueva Transacción</span>
        </button>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>
          <LayoutDashboard size={20} />
          <span>Panel Principal</span>
        </NavLink>
        
        {(user.rol === 'admin' || user.rol === 'cajero') && (
          <NavLink to="/clientes" className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>
            <Users size={20} />
            <span>Clientes</span>
          </NavLink>
        )}

        {user.rol === 'admin' && (
          <NavLink to="/usuarios" className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>
            <Users size={20} />
            <span>Usuarios</span>
          </NavLink>
        )}

        <NavLink to="/cuentas" className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>
          <CreditCard size={20} />
          <span>Cuentas</span>
        </NavLink>

        <NavLink to="/transacciones" className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>
          <ArrowLeftRight size={20} />
          <span>Transacciones</span>
        </NavLink>

        <NavLink to="/solicitudes" className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>
          <FileText size={20} />
          <span>Solicitudes</span>
        </NavLink>

        {user.rol === 'admin' && (
          <NavLink to="/auditoria" className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>
            <FileText size={20} />
            <span>Auditoría</span>
          </NavLink>
        )}
      </nav>
    </div>
  );
};

export default FromSidebar;
