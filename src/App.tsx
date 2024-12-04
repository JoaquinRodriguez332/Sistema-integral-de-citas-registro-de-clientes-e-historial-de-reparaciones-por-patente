import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '/Users/joaquin/Desktop/sistema-citas-reparciones/src/contexts/AuthContext.tsx';
import Login from '/Users/joaquin/Desktop/sistema-citas-reparciones/src/components/Login.tsx';
import Dashboard from '/Users/joaquin/Desktop/sistema-citas-reparciones/src/components/Dashboard.tsx';
import Clientes from '/Users/joaquin/Desktop/sistema-citas-reparciones/src/components/Clientes.tsx';
import Vehiculos from '/Users/joaquin/Desktop/sistema-citas-reparciones/src/components/Vehiculos.tsx';
import Reparaciones from '/Users/joaquin/Desktop/sistema-citas-reparciones/src/components/Reparaciones.tsx';
import Layout from '/Users/joaquin/Desktop/sistema-citas-reparciones/src/components/Layout.tsx';
import Usuarios from '/Users/joaquin/Desktop/sistema-citas-reparciones/src/components/Usuarios.tsx';


const PrivateRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Cargando...</div>;
  }

  return isAuthenticated ? element : <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={
            <PrivateRoute element={
              <Layout>
                <Dashboard />
              </Layout>
            } />
          } />
          <Route path="/clientes" element={
            <PrivateRoute element={
              <Layout>
                <Clientes />
              </Layout>
            } />
          } />
           <Route path="/usuarios" element={
            <PrivateRoute element={
              <Layout>
                <Usuarios />
              </Layout>
            } />
          } />
          <Route path="/vehiculos" element={
            <PrivateRoute element={
              <Layout>
                <Vehiculos />
              </Layout>
            } />
          } />
          <Route path="/reparaciones" element={
            <PrivateRoute element={
              <Layout>
                <Reparaciones />
              </Layout>
            } />
          } />

          
          
          

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;