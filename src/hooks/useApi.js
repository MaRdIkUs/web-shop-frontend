import { useState, useCallback } from 'react';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiCall = useCallback(async (apiFunction, ...args) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiFunction(...args);
      return response;
    } catch (error) {
      console.error('API Error:', error);
      
      // Обрабатываем ошибки авторизации
      if (error.response?.status === 401 || error.response?.status === 302) {
        console.log('🔐 Пользователь не авторизован, перенаправляем на вход...');
        const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
        const loginUrl = `${baseURL}/user/login`;
        window.location.href = loginUrl;
        return null;
      }
      
      // Обрабатываем сетевые ошибки
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        setError('Ошибка подключения к серверу. Проверьте интернет-соединение.');
        throw new Error('Не удалось подключиться к серверу. Проверьте подключение к интернету.');
      }
      
      // Обрабатываем ошибки сервера
      if (error.response?.status >= 500) {
        setError('Ошибка сервера. Попробуйте позже.');
        throw new Error('Ошибка сервера. Попробуйте позже.');
      }
      
      // Обрабатываем ошибки 404
      if (error.response?.status === 404) {
        setError('Запрашиваемый ресурс не найден.');
        throw new Error('Запрашиваемый ресурс не найден.');
      }
      
      // Обрабатываем другие ошибки
      setError(error.message || 'Произошла неизвестная ошибка.');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    apiCall,
    loading,
    error,
    clearError: () => setError(null)
  };
}; 