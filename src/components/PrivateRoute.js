import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const PrivateRoute = ({ roles }) => {
  const { keycloak } = useAuth();

  // Если не аутентифицирован, перенаправляем на вход
  if (!keycloak.authenticated) {
    keycloak.login();
    return null;
  }

  // Проверяем наличие требуемых ролей (если указаны)
  if (roles && roles.length > 0) {
    const hasRole = roles.some(role => keycloak.hasRealmRole(role));
    if (!hasRole) {
      return <Navigate to="/" />;
    }
  }

  // Если всё ок, рендерим вложенные маршруты
  return <Outlet />;
};

export default PrivateRoute;