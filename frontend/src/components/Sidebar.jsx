import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, CreditCard, ArrowLeftRight, FileText, Building2 } from 'lucide-react';
import '../styles/Sidebar.css';

const Sidebar = () => {
  const { user } = useAuth();
  
  if (!user) return null;

  return (
    <div className="sidebar-container">
      <div className="sidebar-header">
        <Building2 size={32} color="#3b82f6" />
        <h2>BancoApp</h2>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        
        {(user.rol === 'admin' || user.rol === 'cajero') && (
          <NavLink to="/clientes" className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>
            <Users size={20} />
            <span>Clientes</span>
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

export default Sidebar;
