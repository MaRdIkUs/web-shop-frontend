import React, { createContext, useState, useEffect, useContext } from 'react';
import UserService from '../services/userService';

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Ключи для localStorage
  const USER_CACHE_KEY = 'auth_user_cache';
  const LAST_UPDATE_KEY = 'auth_last_update';
  const CACHE_DURATION = 10 * 60 * 1000; // 10 минут в миллисекундах

  // Загрузить пользователя из кэша
  const loadUserFromCache = () => {
    try {
      const cachedUser = localStorage.getItem(USER_CACHE_KEY);
      const cachedLastUpdate = localStorage.getItem(LAST_UPDATE_KEY);
      
      if (cachedUser && cachedLastUpdate) {
        const lastUpdateTime = parseInt(cachedLastUpdate);
        const now = Date.now();
        
        // Проверяем, не устарел ли кэш
        if (now - lastUpdateTime < CACHE_DURATION) {
          const userData = JSON.parse(cachedUser);
          setUser(userData);
          setLastUpdate(lastUpdateTime);
          return userData;
        }
      }
    } catch (error) {
      console.warn('Ошибка загрузки кэша авторизации:', error);
    }
    return null;
  };

  // Сохранить пользователя в кэш
  const saveUserToCache = (userData) => {
    try {
      if (userData) {
        localStorage.setItem(USER_CACHE_KEY, JSON.stringify(userData));
        localStorage.setItem(LAST_UPDATE_KEY, Date.now().toString());
      } else {
        localStorage.removeItem(USER_CACHE_KEY);
        localStorage.removeItem(LAST_UPDATE_KEY);
      }
    } catch (error) {
      console.warn('Ошибка сохранения кэша авторизации:', error);
    }
  };

  // Загрузить профиль пользователя с сервера
  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const response = await UserService.getProfile();
      
      if (response.data) {
        const userData = {
          id: response.data.id,
          username: response.data.username,
          role: response.data.role,
          email: response.data.email,
          // Добавьте другие поля по необходимости
        };
        
        setUser(userData);
        saveUserToCache(userData);
        setLastUpdate(Date.now());
        return userData;
      }
    } catch (error) {
      console.log('Ошибка загрузки профиля:', error);
      
      // Если получили 401 или 404, значит пользователь не авторизован
      if (error.response?.status === 401 || error.response?.status === 404) {
        setUser(null);
        saveUserToCache(null);
        return null;
      }
      
      // При других ошибках оставляем текущее состояние
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Обновить профиль пользователя
  const refreshUserProfile = async () => {
    try {
      await loadUserProfile();
    } catch (error) {
      console.warn('Ошибка обновления профиля:', error);
    }
  };

  // Выйти из системы
  const logout = async () => {
    try {
      await UserService.logout();
    } catch (error) {
      console.warn('Ошибка при выходе:', error);
    } finally {
      setUser(null);
      saveUserToCache(null);
      setLastUpdate(null);
    }
  };

  // Войти в систему
  const login = async () => {
    try {
      const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const loginUrl = `${baseURL}/user/login`;
      window.location.href = loginUrl;
    } catch (error) {
      console.error('Ошибка при входе:', error);
      throw error;
    }
  };

  // Инициализация при загрузке
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Сначала пробуем загрузить из кэша
        const cachedUser = loadUserFromCache();
        
        if (cachedUser) {
          // Если кэш актуален, используем его
          setLoading(false);
        } else {
          // Если кэша нет или он устарел, загружаем с сервера
          await loadUserProfile();
        }
      } catch (error) {
        console.error('Ошибка инициализации авторизации:', error);
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Автоматическое обновление каждые 10 минут
  useEffect(() => {
    if (!user) return; // Не обновляем, если пользователь не авторизован

    const interval = setInterval(() => {
      console.log('🔄 Автоматическое обновление профиля пользователя...');
      refreshUserProfile();
    }, CACHE_DURATION);

    return () => clearInterval(interval);
  }, [user]);

  // Проверка авторизации
  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';
  const isUser = user?.role === 'user';

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated,
      isAdmin,
      isUser,
      login,
      logout,
      refreshUserProfile,
      lastUpdate
    }}>
      {children}
    </AuthContext.Provider>
  );
}; 