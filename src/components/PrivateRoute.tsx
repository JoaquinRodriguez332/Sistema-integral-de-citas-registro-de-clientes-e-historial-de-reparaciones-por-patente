import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '/Users/joaquin/Desktop/sistema-citas-reparciones/src/contexts/AuthContext.tsx';

const PrivateRoute: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;