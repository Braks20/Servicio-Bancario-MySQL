import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Wallet, ArrowUpRight, ArrowDownRight, CreditCard } from 'lucide-react';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Bienvenido, {user?.nombre}</h1>
        <p>Aquí tienes un resumen de tu actividad reciente.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <Wallet size={24} />
          </div>
          <div className="stat-info">
            <h3>Saldo Total</h3>
            <p>$12,500.00</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon green">
            <ArrowDownRight size={24} />
          </div>
          <div className="stat-info">
            <h3>Ingresos (Mes)</h3>
            <p>+$3,200.00</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">
            <ArrowUpRight size={24} />
          </div>
          <div className="stat-info">
            <h3>Gastos (Mes)</h3>
            <p>-$850.00</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">
            <CreditCard size={24} />
          </div>
          <div className="stat-info">
            <h3>Tarjetas Activas</h3>
            <p>2</p>
          </div>
        </div>
      </div>
      
      {/* Aquí irá una tabla o lista de transacciones recientes */}
      <div className="recent-activity-placeholder" style={{ marginTop: '2rem', padding: '2rem', background: 'white', borderRadius: '1rem', border: '1px solid #e2e8f0' }}>
        <h3 style={{ marginBottom: '1rem', color: '#0f172a' }}>Transacciones Recientes</h3>
        <p style={{ color: '#64748b' }}>Cargando actividad...</p>
      </div>
    </div>
  );
};

export default Dashboard;
