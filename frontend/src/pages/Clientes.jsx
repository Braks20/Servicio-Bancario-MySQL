import React, { useState, useEffect } from 'react';
import { clienteService } from '../services/clienteService';
import Swal from 'sweetalert2';
import '../styles/SharedPage.css';

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const data = await clienteService.listar();
        setClientes(data);
      } catch (error) {
        console.error("Error cargando clientes", error);
      } finally {
        setLoading(false);
      }
    };
    fetchClientes();
  }, []);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Gestión de Clientes</h1>
        <button 
          className="btn-primary" 
          style={{width: 'auto'}}
          onClick={() => Swal.fire('Información', 'La creación de nuevos clientes estará disponible próximamente.', 'info')}
        >
          + Nuevo Cliente
        </button>
      </div>

      <div className="data-table-container">
        {loading ? (
          <p style={{padding: '2rem'}}>Cargando...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>DNI</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientes.length > 0 ? (
                clientes.map(c => (
                  <tr key={c.id_cliente}>
                    <td>{c.id_cliente}</td>
                    <td>{c.nombre} {c.apellido}</td>
                    <td>{c.numero_documento}</td>
                    <td>
                      <span className={`status-badge ${c.estado}`}>
                        {c.estado.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn-action btn-green" 
                        style={{padding: '4px 8px', marginRight: '5px'}}
                        onClick={() => Swal.fire('Detalles', `Viendo cliente: ${c.nombre} ${c.apellido}`, 'info')}
                      >
                        Ver
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" style={{textAlign: 'center'}}>No hay clientes registrados.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Clientes;
