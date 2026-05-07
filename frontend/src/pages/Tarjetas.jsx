import React from 'react';
import { Shield, Lock, Globe, Zap, Eye, CreditCard, Plus, ArrowRight } from 'lucide-react';
import '../styles/SharedPage.css';
import '../styles/Tarjetas.css';

const Tarjetas = () => {
  return (
    <div className="cards-management-container">
      <div className="page-header">
        <div>
          <h1 style={{fontSize: '2.5rem', fontWeight: 700}}>Card Management</h1>
          <p style={{color: 'var(--text-muted)'}}>Manage limits, security, and settings for your physical and virtual cards.</p>
        </div>
        <button className="btn-outline">
          <Plus size={18} />
          Request New Card
        </button>
      </div>

      <div className="cards-layout">
        <div className="cards-main-view">
          <div className="credit-card-visual">
            <div className="card-top" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
              <div style={{fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em'}}>BANCOAPP ELITE RESERVE</div>
              <div className="card-type" style={{fontStyle: 'italic', fontWeight: 800}}>VISA</div>
            </div>
            
            <div className="card-chip"></div>
            
            <div className="card-number">4289 •••• •••• 1228</div>
            
            <div className="card-details-row">
              <div className="detail-item">
                <div className="detail-label">Cardholder</div>
                <div className="detail-value">BRAKSLEY CAMACHO</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Expires</div>
                <div className="detail-value">12/28</div>
              </div>
            </div>
            
            <Eye size={20} style={{position: 'absolute', right: '2rem', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', opacity: 0.6}} />
          </div>

          <div className="metrics-grid">
            <div className="metric-card">
              <div className="detail-label">Available Credit</div>
              <div style={{fontSize: '1.5rem', fontWeight: 700, marginTop: '0.5rem'}}>$45,250.00</div>
              <div style={{height: '4px', background: '#F1F5F9', borderRadius: '2px', marginTop: '1rem'}}>
                <div style={{width: '65%', height: '100%', background: 'var(--secondary-green)', borderRadius: '2px'}}></div>
              </div>
              <div style={{fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.5rem'}}>Limit: $60,000</div>
            </div>
            
            <div className="metric-card">
              <div className="detail-label">Current Balance</div>
              <div style={{fontSize: '1.5rem', fontWeight: 700, marginTop: '0.5rem'}}>$14,750.00</div>
              <div style={{fontSize: '0.7rem', color: '#B45309', marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                <Zap size={12} /> Payment due in 12 days
              </div>
            </div>

            <div className="metric-card">
              <div className="detail-label">Next Payment Date</div>
              <div style={{fontSize: '1.5rem', fontWeight: 700, marginTop: '0.5rem'}}>Oct 15, 2024</div>
              <div style={{fontSize: '0.7rem', color: 'var(--accent-blue)', marginTop: '1rem', cursor: 'pointer'}}>
                Make a Payment →
              </div>
            </div>
          </div>
          
          <div style={{marginTop: '2.5rem'}}>
            <h3 style={{fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem'}}>Other Cards</h3>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem'}}>
              <div className="card" style={{display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer'}}>
                <div style={{width: 50, height: 35, background: '#1E293B', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.6rem'}}>DEBIT</div>
                <div style={{flex: 1}}>
                  <div style={{fontWeight: 600, fontSize: '0.9rem'}}>Checking Account Debit</div>
                  <div style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>•••• 8821</div>
                </div>
                <ArrowRight size={16} color="var(--text-muted)" />
              </div>
              <div className="card" style={{display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer'}}>
                <div style={{width: 50, height: 35, background: '#E6F9F3', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary-green)', fontSize: '0.6rem'}}>VIRTUAL</div>
                <div style={{flex: 1}}>
                  <div style={{fontWeight: 600, fontSize: '0.9rem'}}>Online Shopping Virtual</div>
                  <div style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>•••• 1093</div>
                </div>
                <ArrowRight size={16} color="var(--text-muted)" />
              </div>
            </div>
          </div>
        </div>

        <div className="security-controls">
          <h3 style={{fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem'}}>Security & Controls</h3>
          
          <div className="control-item">
            <div className="control-icon" style={{background: '#FEE2E2', color: '#EF4444'}}>
              <Lock size={20} />
            </div>
            <div className="control-info">
              <h4>Lock Card</h4>
              <p>Temporarily block all transactions</p>
            </div>
            <label className="switch">
              <input type="checkbox" />
              <span className="slider"></span>
            </label>
          </div>

          <div className="control-item">
            <div className="control-icon">
              <Globe size={20} />
            </div>
            <div className="control-info">
              <h4>Online Payments</h4>
              <p>Allow internet transactions</p>
            </div>
            <label className="switch">
              <input type="checkbox" defaultChecked />
              <span className="slider"></span>
            </label>
          </div>

          <div className="control-item">
            <div className="control-icon">
              <Zap size={20} />
            </div>
            <div className="control-info">
              <h4>International Use</h4>
              <p>Enable foreign transactions</p>
            </div>
            <label className="switch">
              <input type="checkbox" defaultChecked />
              <span className="slider"></span>
            </label>
          </div>

          <div className="control-item">
            <div className="control-icon">
              <CreditCard size={20} />
            </div>
            <div className="control-info">
              <h4>Contactless Payments</h4>
              <p>Tap to pay functionality</p>
            </div>
            <label className="switch">
              <input type="checkbox" defaultChecked />
              <span className="slider"></span>
            </label>
          </div>
          
          <div style={{marginTop: '2rem', textAlign: 'center'}}>
            <button className="btn-text" style={{background: 'none', border: 'none', color: 'var(--text-main)', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem'}}>View PIN</button>
            <div style={{marginTop: '1rem', color: '#EF4444', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer'}}>Report Lost or Stolen</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tarjetas;
