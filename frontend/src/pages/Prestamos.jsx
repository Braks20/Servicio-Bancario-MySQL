import React from 'react';
import '../styles/SharedPage.css';

const Prestamos = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Préstamos</h1>
        <button className="btn-primary" style={{width: 'auto'}}>Solicitar Préstamo</button>
      </div>
      <div className="data-table-container" style={{padding: '2rem', textAlign: 'center'}}>
        <p>Módulo de préstamos en construcción.</p>
      </div>
    </div>
  );
};

export default Prestamos;
