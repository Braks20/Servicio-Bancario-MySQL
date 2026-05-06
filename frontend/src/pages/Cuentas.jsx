import React, { useState, useEffect } from 'react';
import { cuentaService } from '../services/cuentaService';
import '../styles/SharedPage.css';

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
    <div className="page-container">
      <div className="page-header">
        <h1>Cuentas Bancarias</h1>
        <button className="btn-primary" style={{width: 'auto'}}>+ Nueva Cuenta</button>
      </div>

      <div className="data-table-container">
        {loading ? (
          <p style={{padding: '2rem'}}>Cargando...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Número de Cuenta</th>
                <th>Tipo</th>
                <th>Saldo</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cuentas.length > 0 ? (
                cuentas.map(c => (
                  <tr key={c.id_cuenta}>
                    <td>{c.numero_cuenta}</td>
                    <td>{c.tipo_cuenta}</td>
                    <td>${c.saldo}</td>
                    <td>{c.estado}</td>
                    <td><a href="#">Ver Detalles</a></td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" style={{textAlign: 'center'}}>No hay cuentas disponibles.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Cuentas;
