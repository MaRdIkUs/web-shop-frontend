import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requireAuth = true, roles = [] }) => {
  const { user, loading, isAuthenticated } = useAuth();

  // Если еще загружается, показываем индикатор загрузки
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  // Если требуется авторизация, но пользователь не авторизован
  if (requireAuth && !isAuthenticated) {
    // Перенаправляем на страницу входа
    const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    const loginUrl = `${baseURL}/user/login`;
    window.location.href = loginUrl;
    return null;
  }

  // Если требуются определенные роли
  if (roles.length > 0 && user) {
    const hasRequiredRole = roles.includes(user.role);
    if (!hasRequiredRole) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-red-600 text-2xl mb-4">🚫 Доступ запрещен</div>
            <p className="text-gray-600 mb-4">
              У вас нет прав для доступа к этой странице.
            </p>
            <p className="text-sm text-gray-500">
              Требуемые роли: {roles.join(', ')}
            </p>
          </div>
        </div>
      );
    }
  }

  // Если все проверки пройдены, показываем содержимое
  return children;
};

export default ProtectedRoute; 