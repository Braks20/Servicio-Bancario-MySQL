import React from 'react';
import '../styles/SharedPage.css';

const Auditoria = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Auditoría del Sistema</h1>
      </div>
      <div className="data-table-container" style={{padding: '2rem', textAlign: 'center'}}>
        <p>Historial de logs de auditoría (Solo Admins).</p>
      </div>
    </div>
  );
};

export default Auditoria;
