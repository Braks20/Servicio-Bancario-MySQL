import React, { useState, useEffect } from 'react';
import { transaccionService } from '../services/transaccionService';
import { cuentaService } from '../services/cuentaService';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';
import { Search, Calendar, Download, Filter, Plus, ArrowUpRight, ArrowDownRight, CreditCard, ShoppingBag, Landmark } from 'lucide-react';
import '../styles/SharedPage.css';
import '../styles/Transacciones.css';

const Transacciones = () => {
  const [transacciones, setTransacciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cuentas, setCuentas] = useState([]);
  const { user } = useAuth();

  const fetchTransacciones = async () => {
    try {
      const data = await transaccionService.listar();
      // El backend devuelve { total, page, totalPages, data }
      setTransacciones(data.data || []);
    } catch (error) {
      console.error("Error cargando transacciones", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCuentas = async () => {
    try {
      const response = await cuentaService.listar();
      setCuentas(response.data || []);
    } catch (error) {
      console.error("Error cargando cuentas", error);
    }
  };

  useEffect(() => {
    fetchTransacciones();
    fetchCuentas();
  }, []);

  const handleDeposito = async () => {
    if (cuentas.length === 0) {
      return Swal.fire('Error', 'Debes tener al menos una cuenta para depositar.', 'error');
    }

    const { value: formValues } = await Swal.fire({
      title: 'Realizar Depósito',
      html:
        `<select id="swal-input1" class="swal2-input">
          ${cuentas.map(c => `<option value="${c.id}">${c.numero_cuenta} (${c.tipo})</option>`).join('')}
        </select>` +
        '<input id="swal-input2" type="number" class="swal2-input" placeholder="Monto ($)">' +
        '<input id="swal-input3" class="swal2-input" placeholder="Descripción">',
      focusConfirm: false,
      preConfirm: () => {
        return {
          cuenta_destino: document.getElementById('swal-input1').value,
          monto: document.getElementById('swal-input2').value,
          descripcion: document.getElementById('swal-input3').value
        }
      }
    });

    if (formValues) {
      try {
        await transaccionService.deposito(formValues);
        Swal.fire('¡Éxito!', 'Depósito realizado correctamente.', 'success');
        fetchTransacciones();
      } catch (error) {
        Swal.fire('Error', error.response?.data?.error || 'No se pudo realizar el depósito.', 'error');
      }
    }
  };

  const handleTransferencia = async () => {
    if (cuentas.length === 0) {
      return Swal.fire('Error', 'Debes tener al menos una cuenta de origen.', 'error');
    }

    const { value: formValues } = await Swal.fire({
      title: 'Realizar Transferencia',
      html:
        '<label>Cuenta Origen</label>' +
        `<select id="swal-input1" class="swal2-input">
          ${cuentas.map(c => `<option value="${c.id}">${c.numero_cuenta} - Saldo: $${c.saldo_disponible}</option>`).join('')}
        </select>` +
        '<label>Número de Cuenta Destino</label>' +
        '<input id="swal-input2" class="swal2-input" placeholder="Número de cuenta">' +
        '<label>Monto</label>' +
        '<input id="swal-input3" type="number" class="swal2-input" placeholder="Monto ($)">' +
        '<label>Descripción</label>' +
        '<input id="swal-input4" class="swal2-input" placeholder="Descripción">',
      focusConfirm: false,
      preConfirm: () => {
        return {
          cuenta_origen: document.getElementById('swal-input1').value,
          numero_destino: document.getElementById('swal-input2').value,
          monto: document.getElementById('swal-input3').value,
          descripcion: document.getElementById('swal-input4').value
        }
      }
    });

    if (formValues) {
      // Confirmación final
      const confirm = await Swal.fire({
        title: '¿Estás seguro?',
        text: `Vas a transferir $${formValues.monto} a la cuenta ${formValues.numero_destino}`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, enviar dinero',
        cancelButtonText: 'Cancelar'
      });

      if (confirm.isConfirmed) {
        try {
          await transaccionService.transferencia({
            cuenta_origen: formValues.cuenta_origen,
            numero_destino: formValues.numero_destino,
            monto: formValues.monto,
            descripcion: formValues.descripcion
          });
          
          Swal.fire('¡Enviado!', 'La transferencia ha sido exitosa.', 'success');
          fetchTransacciones();
          fetchCuentas();
        } catch (error) {
          Swal.fire('Error', error.response?.data?.error || 'No se pudo realizar la transferencia.', 'error');
        }
      }
    }
  };

  return (
    <div className="transactions-container">
      <div className="page-header">
        <div>
          <h1 style={{fontSize: '2.5rem', fontWeight: 700}}>Transactions</h1>
          <p style={{color: 'var(--text-muted)'}}>Review your spending and income history.</p>
        </div>
        <div style={{display: 'flex', gap: '1rem'}}>
          <button className="btn-outline" onClick={() => Swal.fire('CSV', 'Exportando transacciones...', 'success')}>
            <Download size={18} />
            Export CSV
          </button>
          <button className="btn-primary" style={{background: '#000'}} onClick={handleTransferencia}>
            <Plus size={18} />
            New Transaction
          </button>
        </div>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem', marginTop: '2rem'}}>
        <div className="transactions-main">
          <div className="transactions-controls">
            <div className="search-wrapper">
              <Search className="search-icon" size={18} />
              <input type="text" className="search-input" placeholder="Search merchants, amounts..." />
            </div>
            <div className="filter-group">
              <button className="filter-btn active">All Types</button>
              <button className="filter-btn">Income</button>
              <button className="filter-btn">Expense</button>
            </div>
            <button className="filter-btn">
              <Calendar size={16} />
              Last 30 Days
            </button>
          </div>

          <div className="transactions-list">
            <div className="transaction-group-label">Today, Oct 24</div>
            {loading ? (
              <p style={{textAlign: 'center', padding: '2rem'}}>Loading transactions...</p>
            ) : transacciones.length > 0 ? (
              transacciones.map(t => (
                <div key={t.id} className="transaction-row" onClick={() => Swal.fire('Detalles', `Transacción: ${t.uuid}`, 'info')}>
                  <div className={`transaction-icon-box ${(t.tipo === 'deposito' || t.tipo === 'pago') ? 'income' : ''}`}>
                    {t.tipo === 'deposito' ? <Landmark size={20} /> : t.tipo === 'transferencia' ? <ArrowUpRight size={20} /> : <ShoppingBag size={20} />}
                  </div>
                  <div className="transaction-info">
                    <div className="transaction-name">{t.descripcion || 'Sin descripción'}</div>
                    <div className="transaction-meta">
                      {t.tipo.toUpperCase()} • {new Date(t.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </div>
                  <div className="transaction-amount-container">
                    <div className={`transaction-amount ${(t.tipo === 'deposito' || t.tipo === 'pago') ? 'positive' : 'negative'}`}>
                      {(t.tipo === 'deposito' || t.tipo === 'pago') ? '+' : '-'}${parseFloat(t.monto).toLocaleString()}
                    </div>
                    <div className="transaction-status">{t.estado.toUpperCase()}</div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '1rem', border: '1px solid var(--border-color)'}}>
                <p style={{color: 'var(--text-muted)'}}>No transactions found in this period.</p>
              </div>
            )}
          </div>
        </div>

        <div className="transactions-sidebar">
          <div className="summary-card">
            <div className="summary-label">Period Summary</div>
            <div className="summary-value" style={{color: '#ef4444'}}>- $4,250.00</div>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem'}}>
              <button className="btn-outline" style={{padding: '0.5rem', fontSize: '0.8rem'}}>
                <Download size={14} /> PDF
              </button>
              <button className="btn-outline" style={{padding: '0.5rem', fontSize: '0.8rem'}}>
                <Download size={14} /> CSV
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transacciones;
