import React, { useState, useEffect } from 'react';
import { usuarioService } from '../services/usuarioService';
import Swal from 'sweetalert2';
import '../styles/SharedPage.css';

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsuarios = async () => {
    try {
      const data = await usuarioService.listar();
      setUsuarios(data);
    } catch (error) {
      console.error("Error cargando usuarios", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const toggleEstado = async (u) => {
    const nuevoEstado = u.estado === 'activo' ? 'inactivo' : 'activo';
    
    const confirm = await Swal.fire({
      title: '¿Cambiar estado?',
      text: `Deseas cambiar el estado de ${u.username} a ${nuevoEstado}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, cambiar',
      cancelButtonText: 'Cancelar'
    });

    if (confirm.isConfirmed) {
      try {
        await usuarioService.cambiarEstado(u.id, nuevoEstado);
        Swal.fire('¡Éxito!', `Usuario ahora está ${nuevoEstado}.`, 'success');
        fetchUsuarios();
      } catch (error) {
        Swal.fire('Error', 'No se pudo cambiar el estado.', 'error');
      }
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Administración de Usuarios</h1>
      </div>

      <div className="data-table-container">
        {loading ? (
          <p style={{padding: '2rem'}}>Cargando...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Rol</th>
                <th>Cliente</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.length > 0 ? (
                usuarios.map(u => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.username}</td>
                    <td>{u.rol?.nombre}</td>
                    <td>{u.cliente ? `${u.cliente.nombre} ${u.cliente.apellido}` : 'Sistema'}</td>
                    <td>
                      <span className={`status-badge ${u.estado}`}>
                        {u.estado.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <button 
                        className={`btn-action ${u.estado === 'activo' ? 'btn-red' : 'btn-green'}`}
                        onClick={() => toggleEstado(u)}
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', cursor: 'pointer' }}
                      >
                        {u.estado === 'activo' ? 'Desactivar' : 'Activar'}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6" style={{textAlign: 'center'}}>No hay usuarios registrados.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Usuarios;
