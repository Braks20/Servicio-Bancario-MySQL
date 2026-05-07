import React, { useState, useEffect } from 'react';
import { cuentaService } from '../services/cuentaService';
import Swal from 'sweetalert2';
import { Landmark, Wallet, Building2, Plus, ArrowRight } from 'lucide-react';
import '../styles/SharedPage.css';
import '../styles/Cuentas.css';

const Cuentas = () => {
  const [cuentas, setCuentas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCuentas = async () => {
      try {
        const data = await cuentaService.listar();
        setCuentas(data);
      } catch (error) {
        console.error("Error cargando cuentas", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCuentas();
  }, []);

  return (
    <div className="page-container" style={{maxWidth: '1200px', margin: '0 auto', padding: '2rem'}}>
      <div className="page-header" style={{marginBottom: '1rem'}}>
        <div>
          <h1 style={{fontSize: '2.5rem', fontWeight: 700}}>Your Accounts</h1>
          <p style={{color: 'var(--text-muted)'}}>Manage your assets and daily finances.</p>
        </div>
        <button 
          className="btn-primary" 
          style={{background: 'var(--secondary-green)', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem'}}
          onClick={() => Swal.fire('Información', 'La apertura de nuevas cuentas estará disponible próximamente.', 'info')}
        >
          <Plus size={20} />
          Open New Account
        </button>
      </div>

      {loading ? (
        <div style={{textAlign: 'center', padding: '4rem'}}>
          <p>Cargando tus cuentas...</p>
        </div>
      ) : (
        <div className="accounts-grid">
          {cuentas.length > 0 ? (
            cuentas.map(c => (
              <div key={c.id} className="account-card">
                <div className="account-card-header">
                  <div className="account-icon-box">
                    {c.tipo === 'ahorro' ? <Wallet size={24} /> : <Landmark size={24} />}
                  </div>
                  <span className={`badge ${c.estado === 'activa' ? 'success' : 'pending'}`}>
                    {c.estado}
                  </span>
                </div>
                
                <div className="account-type-info">
                  <h3>{c.tipo.charAt(0).toUpperCase() + c.tipo.slice(1)} Account</h3>
                  <p className="account-number">•••• •••• •••• {c.numero_cuenta.slice(-4)}</p>
                </div>

                <div className="account-balance-section">
                  <p className="balance-title">Available Balance</p>
                  <p className="balance-value">${parseFloat(c.saldo_disponible).toLocaleString()}</p>
                </div>

                <div className="account-card-footer">
                  <a href="#" className="view-details-link">View Details &gt;</a>
                  {c.tipo === 'ahorro' && <span className="yield-badge">+4.5% APY</span>}
                </div>
              </div>
            ))
          ) : (
            <div className="no-accounts-placeholder" style={{gridColumn: '1/-1', textAlign: 'center', padding: '4rem', background: 'white', borderRadius: '1.5rem', border: '1px solid var(--border-color)'}}>
              <p style={{color: 'var(--text-muted)'}}>No tienes cuentas activas todavía.</p>
            </div>
          )}
          
          <div className="account-card" style={{border: '2px dashed var(--border-color)', background: 'transparent', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', minHeight: '280px'}} onClick={() => Swal.fire('Información', 'Funcionalidad en desarrollo', 'info')}>
            <div style={{width: 48, height: 48, borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center'}}>
              <Plus size={24} color="var(--text-muted)" />
            </div>
            <div style={{textAlign: 'center'}}>
              <h3 style={{fontSize: '1.1rem', fontWeight: 700}}>Open an Account</h3>
              <p style={{fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '200px', margin: '0 auto'}}>Explore new savings, checking, or investment options.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cuentas;
