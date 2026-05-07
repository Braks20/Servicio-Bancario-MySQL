import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Wallet, ArrowUpRight, ArrowDownRight, CreditCard, Users, Shield, 
  Landmark, AlertCircle, PlusCircle, Clock, TrendingUp, EyeOff, 
  Plus, ChevronDown, UserPlus, UserMinus, FileText, Activity
} from 'lucide-react';
import { cuentaService } from '../services/cuentaService';
import { solicitudService } from '../services/solicitudService';
import { statsService } from '../services/statsService';
import { auditoriaService } from '../services/auditoriaService';
import Swal from 'sweetalert2';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.rol === 'admin';
  
  const [cuentas, setCuentas] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [stats, setStats] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('today');

  const fetchData = async () => {
    setLoading(true);
    try {
      if (isAdmin) {
        const [statsData, auditData] = await Promise.all([
          statsService.getDashboardStats(),
          auditoriaService.listar()
        ]);
        setStats(statsData);
        setAuditLogs(auditData.data.slice(0, 5));
      } else {
        const response = await cuentaService.listar();
        const misCuentas = response.data.filter(c => c.cliente_id === user?.cliente?.id);
        setCuentas(misCuentas || []);
        
        const dataSolicitudes = await solicitudService.listar();
        setSolicitudes(dataSolicitudes.filter(s => s.estado === 'pendiente'));
      }
    } catch (error) {
      console.error("Error cargando datos del dashboard", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, timeFilter]);

  const handleSolicitarCuenta = async () => {
    const { value: tipo } = await Swal.fire({
      title: 'Solicitar Nueva Cuenta',
      input: 'select',
      inputOptions: {
        'ahorro': 'Cuenta de Ahorro',
        'corriente': 'Cuenta Corriente',
        'plazo_fijo': 'Plazo Fijo',
        'empresarial': 'Empresarial'
      },
      inputPlaceholder: 'Selecciona el tipo de cuenta',
      showCancelButton: true,
      confirmButtonText: 'Enviar Solicitud',
      cancelButtonText: 'Cancelar'
    });

    if (tipo) {
      try {
        await solicitudService.crear({ tipo_cuenta: tipo });
        Swal.fire('Solicitud Enviada', 'Tu petición ha sido enviada al administrador para su aprobación.', 'success');
        fetchData();
      } catch (error) {
        Swal.fire('Error', error.response?.data?.error || 'No se pudo enviar la solicitud.', 'error');
      }
    }
  };

  const SkeletonKPI = () => (
    <div className="balance-card skeleton-container">
      <div className="skeleton skeleton-title"></div>
      <div className="skeleton skeleton-amount"></div>
      <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
        <div className="skeleton" style={{ height: '40px', width: '120px' }}></div>
        <div className="skeleton" style={{ height: '40px', width: '120px' }}></div>
      </div>
    </div>
  );

  const SkeletonList = () => (
    <div className="activity-card">
      {[1, 2, 3].map(i => (
        <div key={i} className="activity-item">
          <div className="skeleton activity-icon"></div>
          <div className="activity-details">
            <div className="skeleton skeleton-text" style={{ width: '40%' }}></div>
            <div className="skeleton skeleton-text" style={{ width: '60%' }}></div>
          </div>
        </div>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div className="skeleton skeleton-title" style={{ height: '3rem', width: '40%' }}></div>
          <div className="skeleton skeleton-text" style={{ width: '30%' }}></div>
        </div>
        <div className="dashboard-grid">
          <div className="left-column">
            <SkeletonKPI />
            <div style={{ marginTop: '2rem' }}><SkeletonList /></div>
          </div>
          <div className="right-column">
            <div className="spending-card skeleton" style={{ height: '300px' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin && cuentas.length === 0 && solicitudes.length === 0) {
    return (
      <div className="dashboard-container">
        <div className="no-accounts-card" style={{ 
          background: 'white', padding: '3rem', borderRadius: '1.5rem', 
          textAlign: 'center', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
          maxWidth: '600px', margin: '4rem auto'
        }}>
          <div style={{ background: '#eff6ff', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: '#3b82f6' }}>
            <AlertCircle size={40} />
          </div>
          <h2 style={{ fontSize: '1.8rem', color: '#1e293b', marginBottom: '1rem' }}>No tienes cuentas activas</h2>
          <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: '2rem' }}>
            Para comenzar, debes solicitar la apertura de una cuenta bancaria.
          </p>
          <button className="btn-primary" onClick={handleSolicitarCuenta} style={{ padding: '1rem 2rem', margin: '0 auto' }}>
            <PlusCircle size={20} /> Solicitar mi primera cuenta
          </button>
        </div>
      </div>
    );
  }

  const saldoTotal = cuentas.reduce((acc, c) => acc + parseFloat(c.saldo_disponible), 0);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Buen día, {user?.cliente?.nombre || user?.username}.</h1>
          <p>{isAdmin ? "Estado de la plataforma y resumen del sistema." : "Aquí tienes un resumen de tu portafolio financiero."}</p>
        </div>
        
        {isAdmin && (
          <div className="dashboard-filter-bar">
            <select 
              className="filter-select" 
              value={timeFilter} 
              onChange={(e) => setTimeFilter(e.target.value)}
            >
              <option value="today">Hoy</option>
              <option value="yesterday">Ayer</option>
              <option value="week">Esta Semana</option>
              <option value="month">Este Mes</option>
            </select>
          </div>
        )}
      </div>

      <div className="dashboard-grid">
        <div className="left-column">
          <div className="balance-card">
            <div className="balance-label">
              <span className="dot" style={{ width: 8, height: 8, borderRadius: '50%', background: isAdmin ? 'var(--primary-accent)' : 'var(--secondary-green)' }}></span>
              {isAdmin ? "TOTAL DE USUARIOS ACTIVOS" : "SALDO TOTAL CONSOLIDADO"}
              <TrendingUp size={16} color={isAdmin ? "var(--primary-accent)" : "var(--secondary-green)"} />
              <span className="balance-trend" style={{ background: isAdmin ? '#e0f2fe' : '#E6F9F3', color: isAdmin ? '#0369a1' : 'var(--secondary-green)' }}>
                {isAdmin ? `+${stats?.kpis?.pendingRequests || 0} pendientes` : "+2.4%"}
              </span>
            </div>
            <div className="balance-amount">
              {isAdmin ? (stats?.kpis?.totalUsers || 0) : `Q${saldoTotal.toLocaleString()}`}
              {!isAdmin && <EyeOff size={24} color="var(--text-muted)" style={{ cursor: 'pointer' }} />}
            </div>
            
            <div className="balance-actions">
              {isAdmin ? (
                <>
                  <div className="admin-actions-dropdown">
                    <button className="btn-primary" style={{ background: '#000', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      Gestión Crítica <ChevronDown size={18} />
                    </button>
                    <div className="dropdown-content">
                      <button className="dropdown-item" onClick={() => navigate('/usuarios')}>
                        <UserPlus size={18} /> Crear Nuevo Usuario
                      </button>
                      <button className="dropdown-item" onClick={() => navigate('/usuarios')}>
                        <UserMinus size={18} /> Suspender Cuenta
                      </button>
                      <button className="dropdown-item" onClick={() => Swal.fire('Reporte Generado', 'El reporte de rendimiento mensual ha sido enviado a tu correo.', 'success')}>
                        <FileText size={18} /> Generar Reporte Mensual
                      </button>
                    </div>
                  </div>
                  <button className="btn-outline" onClick={() => navigate('/auditoria')}>Logs de Auditoría</button>
                </>
              ) : (
                <>
                  <button className="btn-primary" style={{ background: '#000' }} onClick={() => navigate('/transacciones')}>Enviar Dinero</button>
                  <button className="btn-outline">Pagar Servicios</button>
                  <button className="btn-outline">Recargar</button>
                </>
              )}
            </div>
          </div>

          <div className="activity-card" style={{ marginTop: '2rem' }}>
            <div className="activity-header">
              <h3>{isAdmin ? "Log de Auditoría en Tiempo Real" : "Actividad Reciente"}</h3>
              <button className="btn-text" onClick={() => navigate(isAdmin ? '/auditoria' : '/transacciones')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontWeight: 600, cursor: 'pointer' }}>Ver Todo</button>
            </div>
            
            <div className="activity-list">
              {isAdmin ? (
                auditLogs.map((log) => (
                  <div key={log.id} className="activity-item">
                    <div className="activity-icon" style={{ background: log.accion.includes('ERROR') || log.accion.includes('BLOQUEO') ? '#fef2f2' : '#f1f5f9' }}>
                      {log.accion.includes('LOGIN') ? <Shield size={20} /> : <Activity size={20} />}
                    </div>
                    <div className="activity-details">
                      <h4>{log.usuario?.username || 'Sistema'}: {log.accion}</h4>
                      <p>{log.tabla_afectada} • {new Date(log.created_at).toLocaleTimeString()}</p>
                    </div>
                    <div className="activity-amount" style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      IP: {log.ip}
                    </div>
                  </div>
                ))
              ) : (
                cuentas.length > 0 ? (
                  <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>Consulta tus transacciones para ver el historial detallado.</p>
                ) : (
                  <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No hay actividad reciente para mostrar.</p>
                )
              )}
            </div>
          </div>
        </div>

        <div className="right-column">
          <div className="spending-card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
              {isAdmin ? "Crecimiento de la Plataforma" : "Gastos Mensuales"}
            </h3>
            <div className="chart-placeholder">
              {(isAdmin ? (stats?.platformGrowth || []) : [40, 60, 45, 90, 70]).map((item, idx) => (
                <div 
                  key={idx} 
                  className={`bar ${(isAdmin ? idx === 5 : idx === 4) ? 'active' : ''}`} 
                  style={{ height: `${isAdmin ? (item.count * 20 + 10) : item}%` }}
                  title={isAdmin ? `${item.month}: ${item.count} usuarios` : ''}
                ></div>
              ))}
            </div>
            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {isAdmin ? "Volumen Transaccional Total (Hoy)" : "Este Mes"}
                </p>
                <p style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                  Q{(isAdmin ? (stats?.kpis?.transactionalVolume || 0) : 14230.50).toLocaleString()}
                </p>
              </div>
              <button className="btn-text" style={{ background: 'none', border: 'none', color: 'var(--secondary-green)', fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem' }}>Detalles &gt;</button>
            </div>
          </div>
          
          {!isAdmin && (
            <div className="card" style={{ marginTop: '2rem', border: '2px dashed var(--border-color)', background: 'transparent', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', cursor: 'pointer' }} onClick={handleSolicitarCuenta}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Plus size={20} color="var(--text-muted)" />
              </div>
              <div style={{ textAlign: 'center' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Abrir una Cuenta</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Explora nuevas opciones de ahorro, cheques o inversión.</p>
              </div>
            </div>
          )}

          {isAdmin && (
            <div className="card" style={{ marginTop: '2rem', background: 'var(--primary-dark)', color: 'white' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '0.5rem', borderRadius: '0.5rem' }}>
                  <Shield size={24} color="#fbbf24" />
                </div>
                <h4 style={{ fontWeight: 700 }}>Resumen de Seguridad</h4>
              </div>
              <p style={{ fontSize: '0.85rem', opacity: 0.8, marginBottom: '1.5rem' }}>
                {stats?.kpis?.securityAlerts || 0} posibles incidentes de seguridad detectados en las últimas 24 horas.
              </p>
              <button 
                className="btn-primary" 
                style={{ width: '100%', background: '#fbbf24', color: '#000', border: 'none' }}
                onClick={() => navigate('/auditoria')}
              >
                Revisar Alertas
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
