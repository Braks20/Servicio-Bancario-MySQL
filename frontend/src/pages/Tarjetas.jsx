import React from 'react';
import '../styles/SharedPage.css';

const Tarjetas = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Tarjetas de Crédito</h1>
        <button className="btn-primary" style={{width: 'auto'}}>Solicitar Tarjeta</button>
      </div>
      <div className="data-table-container" style={{padding: '2rem', textAlign: 'center'}}>
        <p>Módulo de tarjetas en construcción.</p>
      </div>
    </div>
  );
};

export default Tarjetas;
