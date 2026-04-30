import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Send, AlertCircle, CheckCircle } from 'lucide-react';

const Transferencias = () => {
  const { authFetch, usuario } = useContext(AuthContext);
  const [cuentasPropias, setCuentasPropias] = useState([]);
  const [formData, setFormData] = useState({
    cuenta_origen: '',
    cuenta_destino: '',
    monto: '',
    descripcion: ''
  });
  const [estado, setEstado] = useState({ loading: false, error: null, success: false });

  useEffect(() => {
    const cargarCuentas = async () => {
      try {
        const res = await authFetch('/cuentas');
        const data = await res.json();
        setCuentasPropias(data);
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, cuenta_origen: data[0].id }));
        }
      } catch (error) {
        console.error('Error al cargar cuentas', error);
      }
    };
    cargarCuentas();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setEstado({ ...estado, error: null, success: false });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEstado({ loading: true, error: null, success: false });

    try {
      const res = await authFetch('/transacciones/transferencia', {
        method: 'POST',
        body: JSON.stringify({
          cuenta_origen: parseInt(formData.cuenta_origen),
          cuenta_destino: parseInt(formData.cuenta_destino),
          monto: parseFloat(formData.monto),
          descripcion: formData.descripcion
        })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Error al procesar transferencia');

      setEstado({ loading: false, error: null, success: true });
      setFormData({ ...formData, monto: '', descripcion: '', cuenta_destino: '' });
      
    } catch (error) {
      setEstado({ loading: false, error: error.message, success: false });
    }
  };

  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: '32px' }}>
        <h1 className="text-h2">Transferencias</h1>
        <p className="text-muted text-lg mt-1">Envía dinero de forma rápida y segura.</p>
      </header>

      <div className="grid-cols-2" style={{ gap: '32px', alignItems: 'start' }}>
        <div className="card glass">
          <h2 className="text-h3 text-primary mb-6">Nueva Transferencia</h2>
          
          {estado.error && (
            <div className="badge-danger" style={{ padding: '16px', borderRadius: '8px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <AlertCircle size={20} />
              <span>{estado.error}</span>
            </div>
          )}

          {estado.success && (
            <div className="badge-success" style={{ padding: '16px', borderRadius: '8px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <CheckCircle size={20} />
              <span>¡Transferencia realizada con éxito!</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label">Cuenta de Origen</label>
              <select 
                name="cuenta_origen" 
                className="input-field" 
                value={formData.cuenta_origen} 
                onChange={handleChange}
                required
              >
                <option value="" disabled>Selecciona una cuenta</option>
                {cuentasPropias.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.tipo.toUpperCase()} - **** {c.numero_cuenta.slice(-4)} (Q {parseFloat(c.saldo).toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Cuenta de Destino (ID)</label>
              <input 
                type="number" 
                name="cuenta_destino" 
                className="input-field" 
                placeholder="ID de la cuenta a transferir"
                value={formData.cuenta_destino}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Monto (Q)</label>
              <input 
                type="number" 
                step="0.01"
                name="monto" 
                className="input-field" 
                placeholder="0.00"
                value={formData.monto}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group mb-6">
              <label className="input-label">Descripción</label>
              <input 
                type="text" 
                name="descripcion" 
                className="input-field" 
                placeholder="Motivo de la transferencia"
                value={formData.descripcion}
                onChange={handleChange}
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '16px' }}
              disabled={estado.loading || cuentasPropias.length === 0}
            >
              {estado.loading ? 'Procesando...' : 'Enviar Dinero'}
              {!estado.loading && <Send size={18} />}
            </button>
          </form>
        </div>

        <div>
          <div className="card glass" style={{ background: 'var(--primary)', color: 'white' }}>
             <h3 style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '16px' }}>Límites Diarios</h3>
             <div className="flex-between mb-2">
               <span>Utilizado hoy</span>
               <span className="font-bold">Q 0.00</span>
             </div>
             <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.2)', borderRadius: '4px', marginBottom: '8px' }}>
                <div style={{ width: '0%', height: '100%', background: 'var(--success)', borderRadius: '4px' }}></div>
             </div>
             <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>Disponible: Q 15,000.00</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transferencias;
