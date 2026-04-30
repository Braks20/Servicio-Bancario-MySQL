import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { CreditCard, TrendingUp, TrendingDown, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const Dashboard = () => {
  const { usuario, authFetch } = useContext(AuthContext);
  const [cuentas, setCuentas] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const fetchDatos = async () => {
      try {
        const res = await authFetch('/cuentas');
        const data = await res.json();
        setCuentas(data);
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setCargando(false);
      }
    };

    fetchDatos();
  }, []);

  const saldoTotal = cuentas.reduce((acc, cuenta) => acc + parseFloat(cuenta.saldo), 0);

  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: '32px' }}>
        <h1 className="text-h2">Hola, {usuario.username} 👋</h1>
        <p className="text-muted text-lg mt-1">Aquí tienes el resumen de tu estado financiero hoy.</p>
      </header>

      {/* Tarjetas de Resumen */}
      <div className="grid-cols-3" style={{ marginBottom: '32px' }}>
        <div className="card" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)', color: 'white', border: 'none' }}>
          <div className="flex-between mb-4">
            <h3 style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1rem', fontWeight: '500' }}>Balance Total</h3>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '8px', borderRadius: '8px' }}>
              <CreditCard size={20} color="white" />
            </div>
          </div>
          <div className="text-h1" style={{ color: 'white', marginBottom: '8px' }}>
            Q {saldoTotal.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', color: 'rgba(255,255,255,0.8)' }}>
            <span style={{ color: '#2ECC71', display: 'flex', alignItems: 'center' }}>
              <ArrowUpRight size={16} /> +2.4%
            </span>
            vs mes anterior
          </div>
        </div>

        <div className="card glass">
          <div className="flex-between mb-4">
            <h3 className="text-muted" style={{ fontSize: '1rem', fontWeight: '500' }}>Ingresos (Mes)</h3>
            <div style={{ background: 'var(--success-bg)', padding: '8px', borderRadius: '8px' }}>
              <TrendingUp size={20} className="text-success" />
            </div>
          </div>
          <div className="text-h2 text-primary mb-2">Q 4,500.00</div>
          <p className="text-sm text-muted">12 transacciones recibidas</p>
        </div>

        <div className="card glass">
          <div className="flex-between mb-4">
            <h3 className="text-muted" style={{ fontSize: '1rem', fontWeight: '500' }}>Gastos (Mes)</h3>
            <div style={{ background: 'var(--danger-bg)', padding: '8px', borderRadius: '8px' }}>
              <TrendingDown size={20} className="text-danger" />
            </div>
          </div>
          <div className="text-h2 text-primary mb-2">Q 1,240.50</div>
          <p className="text-sm text-muted">8 transacciones enviadas</p>
        </div>
      </div>

      {/* Sección de Cuentas y Actividad */}
      <div className="grid-cols-2" style={{ gap: '32px' }}>
        
        {/* Mis Cuentas */}
        <div>
          <div className="flex-between mb-4">
            <h2 className="text-h3 text-primary">Mis Cuentas</h2>
            <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>Ver todas</button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {cargando ? (
              <p className="text-muted">Cargando cuentas...</p>
            ) : cuentas.length > 0 ? (
              cuentas.map(cuenta => (
                <div key={cuenta.id} className="card glass" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(52, 152, 219, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CreditCard className="text-accent" size={24} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary" style={{ fontSize: '1.1rem', textTransform: 'capitalize' }}>
                        Cuenta de {cuenta.tipo}
                      </h4>
                      <p className="text-muted text-sm">**** {cuenta.numero_cuenta.slice(-4)}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="font-bold text-primary" style={{ fontSize: '1.2rem' }}>
                      {cuenta.moneda} {parseFloat(cuenta.saldo).toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                    </div>
                    <span className={`badge ${cuenta.estado === 'activa' ? 'badge-success' : 'badge-warning'}`}>
                      {cuenta.estado}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="card glass" style={{ textAlign: 'center', padding: '32px' }}>
                <p className="text-muted">No tienes cuentas activas.</p>
              </div>
            )}
          </div>
        </div>

        {/* Actividad Reciente */}
        <div>
          <div className="flex-between mb-4">
            <h2 className="text-h3 text-primary">Actividad Reciente</h2>
            <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>Ver historial</button>
          </div>

          <div className="card glass" style={{ padding: '0' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ background: 'var(--success-bg)', padding: '10px', borderRadius: '50%' }}>
                  <ArrowDownRight className="text-success" size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <h4 className="font-semibold text-primary">Transferencia Recibida</h4>
                  <p className="text-muted text-sm">De: Juan Carlos (**** 4432)</p>
                </div>
                <div className="font-bold text-success">+ Q 500.00</div>
              </div>
            </div>

            <div style={{ padding: '20px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ background: 'var(--danger-bg)', padding: '10px', borderRadius: '50%' }}>
                  <ArrowUpRight className="text-danger" size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <h4 className="font-semibold text-primary">Pago de Servicio</h4>
                  <p className="text-muted text-sm">Empresa Eléctrica</p>
                </div>
                <div className="font-bold text-primary">- Q 250.00</div>
              </div>
            </div>

            <div style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ background: 'var(--danger-bg)', padding: '10px', borderRadius: '50%' }}>
                  <ArrowUpRight className="text-danger" size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <h4 className="font-semibold text-primary">Retiro en Cajero</h4>
                  <p className="text-muted text-sm">Zona 10, Guatemala</p>
                </div>
                <div className="font-bold text-primary">- Q 1,000.00</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
