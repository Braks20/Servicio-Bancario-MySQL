import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import FromProtectedRoute from './components/FromProtectedRoute';
import FromLayout from './components/FromLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Cuentas from './pages/Cuentas';
import Transacciones from './pages/Transacciones';
import Prestamos from './pages/Prestamos';
import Tarjetas from './pages/Tarjetas';
import Auditoria from './pages/Auditoria';
import Usuarios from './pages/Usuarios';
import Solicitudes from './pages/Solicitudes';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          
          {/* Rutas Protegidas */}
          <Route element={<FromProtectedRoute />}>
            <Route element={<FromLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/clientes" element={<Clientes />} />
              <Route path="/cuentas" element={<Cuentas />} />
              <Route path="/transacciones" element={<Transacciones />} />
              <Route path="/prestamos" element={<Prestamos />} />
              <Route path="/tarjetas" element={<Tarjetas />} />
              <Route path="/auditoria" element={<Auditoria />} />
              <Route path="/usuarios" element={<Usuarios />} />
              <Route path="/solicitudes" element={<Solicitudes />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
