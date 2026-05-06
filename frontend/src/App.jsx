import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Cuentas from './pages/Cuentas';
import Transacciones from './pages/Transacciones';
import Prestamos from './pages/Prestamos';
import Tarjetas from './pages/Tarjetas';
import Auditoria from './pages/Auditoria';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          
          {/* Rutas Protegidas */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/clientes" element={<Clientes />} />
              <Route path="/cuentas" element={<Cuentas />} />
              <Route path="/transacciones" element={<Transacciones />} />
              <Route path="/prestamos" element={<Prestamos />} />
              <Route path="/tarjetas" element={<Tarjetas />} />
              <Route path="/auditoria" element={<Auditoria />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
