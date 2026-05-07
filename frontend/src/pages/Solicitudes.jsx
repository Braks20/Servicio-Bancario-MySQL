import React, { useState, useEffect } from 'react';
import { solicitudService } from '../services/solicitudService';
import Swal from 'sweetalert2';
import { Check, X, User, Clock } from 'lucide-react';
import '../styles/SharedPage.css';

const Solicitudes = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSolicitudes = async () => {
    try {
      const data = await solicitudService.listar();
      setSolicitudes(data);
    } catch (error) {
      console.error("Error cargando solicitudes", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSolicitudes();
  }, []);

  const handleProcesar = async (id, estado) => {
    let motivo_rechazo = '';
    
    if (estado === 'denegada') {
      const { value: text } = await Swal.fire({
        title: 'Motivo de rechazo',
        input: 'textarea',
        inputPlaceholder: 'Escribe el motivo aquí...',
        showCancelButton: true
      });
      if (!text) return;
      motivo_rechazo = text;
    }

    const confirm = await Swal.fire({
      title: `¿Confirmar ${estado}?`,
      text: `Se notificará al cliente sobre esta decisión.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, procesar',
      cancelButtonText: 'Cancelar'
    });

    if (confirm.isConfirmed) {
      try {
        await solicitudService.procesar(id, estado, motivo_rechazo);
        Swal.fire('Procesado', `La solicitud ha sido ${estado}.`, 'success');
        fetchSolicitudes();
      } catch (error) {
        Swal.fire('Error', error.response?.data?.error || 'No se pudo procesar.', 'error');
      }
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Solicitudes de Cuentas</h1>
        <p>Revisa y aprueba las peticiones de apertura de nuevos clientes.</p>
      </div>

      <div className="data-table-container">
        {loading ? (
          <p style={{padding: '2rem'}}>Cargando solicitudes...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>DPI</th>
                <th>Tipo Cuenta</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {solicitudes.length > 0 ? (
                solicitudes.map(s => (
                  <tr key={s.id}>
                    <td>
                      <div style={{fontWeight: '600'}}>{s.cliente?.nombre} {s.cliente?.apellido}</div>
                    </td>
                    <td>{s.cliente?.dpi}</td>
                    <td>{s.tipo_cuenta?.toUpperCase()} ({s.moneda})</td>
                    <td>{new Date(s.created_at).toLocaleDateString()}</td>
                    <td>
                      <span className={`status-badge ${s.estado}`}>
                        {s.estado.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      {s.estado === 'pendiente' ? (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button 
                            className="btn-action btn-green" 
                            title="Aprobar"
                            onClick={() => handleProcesar(s.id, 'aprobada')}
                          >
                            <Check size={16} />
                          </button>
                          <button 
                            className="btn-action btn-red" 
                            title="Denegar"
                            onClick={() => handleProcesar(s.id, 'denegada')}
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <span style={{fontSize: '0.8rem', color: '#64748b'}}>Sin acciones</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6" style={{textAlign: 'center', padding: '2rem'}}>No hay solicitudes registradas.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Solicitudes;
