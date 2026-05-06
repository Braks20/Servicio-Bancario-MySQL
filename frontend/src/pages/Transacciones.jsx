import React, { useState, useEffect } from 'react';
import { transaccionService } from '../services/transaccionService';
import '../styles/SharedPage.css';

const Transacciones = () => {
  const [transacciones, setTransacciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransacciones = async () => {
      try {
        const data = await transaccionService.listar();
        setTransacciones(data);
      } catch (error) {
        console.error("Error cargando transacciones", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTransacciones();
  }, []);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Transacciones</h1>
        <div style={{display: 'flex', gap: '0.5rem'}}>
          <button className="btn-primary" style={{width: 'auto', background: '#10B981'}}>Depósito</button>
          <button className="btn-primary" style={{width: 'auto', background: '#EF4444'}}>Retiro</button>
          <button className="btn-primary" style={{width: 'auto'}}>Transferencia</button>
        </div>
      </div>

      <div className="data-table-container">
        {loading ? (
          <p style={{padding: '2rem'}}>Cargando...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Monto</th>
                <th>Cuenta Origen</th>
                <th>Cuenta Destino</th>
              </tr>
            </thead>
            <tbody>
              {transacciones.length > 0 ? (
                transacciones.map(t => (
                  <tr key={t.id_transaccion}>
                    <td>{t.id_transaccion}</td>
                    <td>{new Date(t.fecha_transaccion).toLocaleString()}</td>
                    <td>{t.tipo_transaccion}</td>
                    <td style={{color: t.tipo_transaccion === 'deposito' ? '#10B981' : '#EF4444'}}>${t.monto}</td>
                    <td>{t.id_cuenta_origen || '-'}</td>
                    <td>{t.id_cuenta_destino || '-'}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6" style={{textAlign: 'center'}}>No hay transacciones registradas.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Transacciones;
