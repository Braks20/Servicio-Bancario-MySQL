import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { CreditCard, Plus, MoreHorizontal } from 'lucide-react';

const Cuentas = () => {
  const { authFetch } = useContext(AuthContext);
  const [cuentas, setCuentas] = useState([]);
  const [tarjetas, setTarjetas] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const fetchDatos = async () => {
      try {
        const resCuentas = await authFetch('/cuentas');
        const resTarjetas = await authFetch('/tarjetas-credito');
        
        setCuentas(await resCuentas.json());
        
        if (resTarjetas.ok) {
          setTarjetas(await resTarjetas.json());
        }
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setCargando(false);
      }
    };
    fetchDatos();
  }, []);

  return (
    <div className="animate-fade-in">
      <div className="flex-between" style={{ marginBottom: '32px' }}>
        <header>
          <h1 className="text-h2">Cuentas y Tarjetas</h1>
          <p className="text-muted text-lg mt-1">Gestiona tus productos financieros.</p>
        </header>
        <button className="btn btn-primary">
          <Plus size={18} /> Nuevo Producto
        </button>
      </div>

      <div style={{ marginBottom: '40px' }}>
        <h2 className="text-h3 text-primary mb-4">Tarjetas Físicas</h2>
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          
          {/* Diseño Físico de Tarjeta - Efecto Glass y Gradiente */}
          {cuentas.map(cuenta => (
            <div key={cuenta.id} style={{
              width: '340px', height: '210px',
              background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
              borderRadius: '20px',
              padding: '24px',
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 16px 32px rgba(15, 23, 42, 0.2)'
            }}>
              {/* Brillos decorativos tipo tarjeta de crédito */}
              <div style={{ position: 'absolute', width: '200px', height: '200px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', top: '-50px', right: '-50px' }}></div>
              <div style={{ position: 'absolute', width: '150px', height: '150px', background: 'rgba(255,255,255,0.03)', borderRadius: '50%', bottom: '-40px', left: '-40px' }}></div>
              
              <div className="flex-between" style={{ position: 'relative', zIndex: 1, marginBottom: '40px' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', letterSpacing: '1px' }}>NEXUS</div>
                <CreditCard size={24} color="rgba(255,255,255,0.8)" />
              </div>

              <div style={{ position: 'relative', zIndex: 1, fontSize: '1.2rem', letterSpacing: '3px', fontFamily: 'monospace', marginBottom: '24px' }}>
                **** **** **** {cuenta.numero_cuenta.slice(-4)}
              </div>

              <div className="flex-between" style={{ position: 'relative', zIndex: 1 }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>Saldo Disp.</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>Q {parseFloat(cuenta.saldo).toLocaleString()}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>Tipo</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '600', textTransform: 'capitalize' }}>{cuenta.tipo}</div>
                </div>
              </div>
            </div>
          ))}

          {/* Tarjeta de añadir nueva */}
          <div style={{
              width: '340px', height: '210px',
              background: 'transparent',
              border: '2px dashed var(--border)',
              borderRadius: '20px',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-muted)', cursor: 'pointer',
              transition: 'var(--transition)'
            }}
            onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
            onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            <Plus size={32} style={{ marginBottom: '16px' }} />
            <span className="font-semibold">Solicitar Tarjeta</span>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-h3 text-primary mb-4">Detalle de Cuentas</h2>
        <div className="card glass" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(0,0,0,0.02)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '16px 24px', fontWeight: '500', color: 'var(--text-muted)' }}>Número</th>
                <th style={{ padding: '16px 24px', fontWeight: '500', color: 'var(--text-muted)' }}>Tipo</th>
                <th style={{ padding: '16px 24px', fontWeight: '500', color: 'var(--text-muted)' }}>Saldo</th>
                <th style={{ padding: '16px 24px', fontWeight: '500', color: 'var(--text-muted)' }}>Estado</th>
                <th style={{ padding: '16px 24px', fontWeight: '500', color: 'var(--text-muted)', textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cuentas.map(cuenta => (
                <tr key={cuenta.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '16px 24px', fontWeight: '500' }}>{cuenta.numero_cuenta}</td>
                  <td style={{ padding: '16px 24px', textTransform: 'capitalize' }}>{cuenta.tipo}</td>
                  <td style={{ padding: '16px 24px', fontWeight: '600' }}>{cuenta.moneda} {parseFloat(cuenta.saldo).toLocaleString()}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <span className={`badge ${cuenta.estado === 'activa' ? 'badge-success' : 'badge-warning'}`}>
                      {cuenta.estado}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <button className="btn btn-outline" style={{ padding: '4px 8px' }}><MoreHorizontal size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Cuentas;
