import { NavLink } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../context/AuthContext';
import categoryService from '../services/categoryService';

const Navbar = () => {
  const { cartItems, loading: cartLoading, networkError: cartNetworkError, loadCart, getCartItemsCount, isLoaded: cartIsLoaded } = useCart();
  const { user, loading: authLoading, isAuthenticated, login, logout } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCategories, setShowCategories] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [networkError, setNetworkError] = useState(false);

  // Загружаем категории при инициализации
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        setNetworkError(false);
        
        // Загружаем категории
        const categoriesResponse = await categoryService.getAll();
        setCategories(categoriesResponse.data);
      } catch (error) {
        console.error('Ошибка при загрузке категорий', error);
        
        // Детальная диагностика ошибок
        if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
          setNetworkError(true);
          console.warn('Сервер недоступен. Проверьте подключение к интернету и настройки API.');
        } else if (error.response?.status === 404) {
          console.warn('API эндпоинт не найден (404). Возможно, API сервер не запущен или неправильный путь.');
        } else if (error.response?.status >= 500) {
          console.warn('Ошибка сервера (5xx). API сервер работает, но есть внутренние ошибки.');
        } else {
          console.warn('Неизвестная ошибка:', error.response?.status, error.message);
        }
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  const handleLogin = async () => {
    try {
      setLoginLoading(true);
      console.log('🔐 Начинаем процесс входа...');
      await login();
    } catch (error) {
      console.error('❌ Ошибка при попытке входа:', error);
      alert('Ошибка при попытке входа. Попробуйте еще раз.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    }
  };

  // Обработчик клика по корзине - загружаем корзину только при клике
  const handleCartClick = () => {
    if (!cartIsLoaded) {
      console.log('🛒 Загружаем корзину при первом клике...');
      loadCart();
    }
  };

  const getApiStatusMessage = () => {
    if (networkError) {
      return '⚠️ Сервер недоступен';
    }
    if (cartNetworkError) {
      return '⚠️ Ошибка корзины';
    }
    return null;
  };

  return (
    <nav className="bg-gray-800 p-4 text-white">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex space-x-4 items-center">
          <NavLink to="/" className="hover:underline font-semibold">
            Магазин электроники
          </NavLink>
          
          {/* Выпадающее меню категорий */}
          <div className="relative">
            <button
              onMouseEnter={() => setShowCategories(true)}
              onMouseLeave={() => setShowCategories(false)}
              className="hover:underline flex items-center space-x-1"
            >
              <span>Категории</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showCategories && (
              <div
                onMouseEnter={() => setShowCategories(true)}
                onMouseLeave={() => setShowCategories(false)}
                className="absolute top-full left-0 mt-1 w-64 bg-white text-gray-800 rounded-lg shadow-lg z-50"
              >
                {loading ? (
                  <div className="p-3 text-sm">Загрузка категорий...</div>
                ) : networkError ? (
                  <div className="p-3 text-sm text-red-600">
                    Ошибка подключения к серверу
                  </div>
                ) : (
                  <div className="py-2">
                    {categories.map(category => (
                      <NavLink
                        key={category.id}
                        to={`/category/${category.id}`}
                        className="block px-4 py-2 hover:bg-gray-100 text-sm"
                        onClick={() => setShowCategories(false)}
                      >
                        {category.name}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex space-x-4 items-center">
          {getApiStatusMessage() && (
            <div className="text-yellow-300 text-sm">
              {getApiStatusMessage()}
            </div>
          )}
          
          {authLoading ? (
            <span className="text-sm">Загрузка...</span>
          ) : isAuthenticated ? (
            <>
              <span className="text-sm">Привет, {user?.username}</span>
              {user?.role && (
                <span className="text-xs bg-blue-600 px-2 py-1 rounded">
                  {user.role}
                </span>
              )}
              <button 
                onClick={handleLogout}
                className="text-sm hover:underline"
              >
                Выйти
              </button>
            </>
          ) : (
            <button 
              onClick={handleLogin}
              disabled={loginLoading || networkError}
              className="text-sm hover:underline disabled:opacity-50"
            >
              {loginLoading ? 'Вход...' : 'Войти'}
            </button>
          )}
          
          {/* Корзина показывается всегда, но перенаправляет при попытке доступа */}
          <NavLink 
            to="/cart" 
            className="hover:underline flex items-center space-x-1"
            onClick={handleCartClick}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4" />
            </svg>
            <span>
              Корзина ({getCartItemsCount()})
              {cartLoading && <span className="ml-1">...</span>}
            </span>
          </NavLink>

          {isAuthenticated && user?.role?.toLowerCase() === 'admin' && (
            <NavLink to="/admin" className="hover:underline font-semibold text-yellow-300">
              Админ
            </NavLink>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;