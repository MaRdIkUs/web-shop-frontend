import React, { createContext, useState, useEffect } from 'react';
import cartService from '../services/cartService';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [networkError, setNetworkError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Ключи для localStorage
  const CART_CACHE_KEY = 'cart_items_cache';
  const CART_LAST_UPDATE_KEY = 'cart_last_update';
  const CACHE_DURATION = 10 * 60 * 1000; // 10 минут в миллисекундах

  // Загрузить корзину из кэша
  const loadCartFromCache = () => {
    try {
      const cachedCart = localStorage.getItem(CART_CACHE_KEY);
      const cachedLastUpdate = localStorage.getItem(CART_LAST_UPDATE_KEY);
      
      if (cachedCart && cachedLastUpdate) {
        const lastUpdateTime = parseInt(cachedLastUpdate);
        const now = Date.now();
        
        // Проверяем, не устарел ли кэш
        if (now - lastUpdateTime < CACHE_DURATION) {
          const cartData = JSON.parse(cachedCart);
          setCartItems(cartData);
          setIsLoaded(true);
          return cartData;
        }
      }
    } catch (error) {
      console.warn('Ошибка загрузки кэша корзины:', error);
    }
    return null;
  };

  // Сохранить корзину в кэш
  const saveCartToCache = (cartData) => {
    try {
      if (cartData) {
        localStorage.setItem(CART_CACHE_KEY, JSON.stringify(cartData));
        localStorage.setItem(CART_LAST_UPDATE_KEY, Date.now().toString());
      } else {
        localStorage.removeItem(CART_CACHE_KEY);
        localStorage.removeItem(CART_LAST_UPDATE_KEY);
      }
    } catch (error) {
      console.warn('Ошибка сохранения кэша корзины:', error);
    }
  };

  // Загрузить корзину с сервера
  const loadCart = async () => {
    try {
      setLoading(true);
      setNetworkError(false);
      const response = await cartService.getCart();
      
      // Убеждаемся, что response.data является массивом
      const items = Array.isArray(response.data) ? response.data : [];
      setCartItems(items);
      saveCartToCache(items);
      setIsLoaded(true);
    } catch (error) {
      console.error('Ошибка загрузки корзины:', error);
      
      // Проверяем, является ли это сетевой ошибкой
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        setNetworkError(true);
        console.warn('Не удалось загрузить корзину. Сервер недоступен.');
        // При сетевой ошибке оставляем пустой массив
        setCartItems([]);
      } else if (error.response?.status === 404) {
        // Если корзина не найдена, инициализируем пустую
        console.warn('Корзина не найдена, инициализируем пустую');
        setCartItems([]);
        saveCartToCache([]);
      } else if (error.response?.status === 401 || error.response?.status === 302) {
        // Если пользователь не авторизован, очищаем корзину
        console.warn('Пользователь не авторизован, очищаем корзину');
        setCartItems([]);
        saveCartToCache(null);
        
        // Перенаправляем на страницу входа
        const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
        const loginUrl = `${baseURL}/user/login`;
        window.location.href = loginUrl;
      } else {
        // При других ошибках также оставляем пустой массив
        setCartItems([]);
      }
      setIsLoaded(true);
    } finally {
      setLoading(false);
    }
  };

  // Добавить товар в корзину
  const addToCart = async (productId, quantity = 1) => {
    try {
      setNetworkError(false);
      await cartService.addToCart(productId, quantity);
      await loadCart(); // Перезагружаем корзину
    } catch (error) {
      console.error('Ошибка добавления в корзину:', error);
      
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        setNetworkError(true);
        throw new Error('Не удалось добавить товар в корзину. Проверьте подключение к серверу.');
      }
      
      if (error.response?.status === 401 || error.response?.status === 302) {
        // Перенаправляем на страницу входа
        const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
        const loginUrl = `${baseURL}/user/login`;
        window.location.href = loginUrl;
        return;
      }
      
      throw error;
    }
  };

  // Изменить количество товара в корзине
  const updateCartItem = async (itemId, quantity) => {
    try {
      setNetworkError(false);
      await cartService.updateCartItem(itemId, quantity);
      await loadCart(); // Перезагружаем корзину
    } catch (error) {
      console.error('Ошибка обновления корзины:', error);
      
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        setNetworkError(true);
        throw new Error('Не удалось обновить корзину. Проверьте подключение к серверу.');
      }
      
      if (error.response?.status === 401 || error.response?.status === 302) {
        // Перенаправляем на страницу входа
        const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
        const loginUrl = `${baseURL}/user/login`;
        window.location.href = loginUrl;
        return;
      }
      
      throw error;
    }
  };

  // Удалить товар из корзины
  const removeFromCart = async (itemId) => {
    try {
      setNetworkError(false);
      await cartService.removeFromCart(itemId);
      await loadCart(); // Перезагружаем корзину
    } catch (error) {
      console.error('Ошибка удаления из корзины:', error);
      
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        setNetworkError(true);
        throw new Error('Не удалось удалить товар из корзины. Проверьте подключение к серверу.');
      }
      
      if (error.response?.status === 401 || error.response?.status === 302) {
        // Перенаправляем на страницу входа
        const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
        const loginUrl = `${baseURL}/user/login`;
        window.location.href = loginUrl;
        return;
      }
      
      throw error;
    }
  };

  // Очистить корзину
  const clearCart = async () => {
    try {
      setNetworkError(false);
      for (const item of cartItems) {
        await cartService.removeFromCart(item.id);
      }
      setCartItems([]);
      saveCartToCache([]);
    } catch (error) {
      console.error('Ошибка очистки корзины:', error);
      
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        setNetworkError(true);
        throw new Error('Не удалось очистить корзину. Проверьте подключение к серверу.');
      }
      
      if (error.response?.status === 401 || error.response?.status === 302) {
        // Перенаправляем на страницу входа
        const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
        const loginUrl = `${baseURL}/user/login`;
        window.location.href = loginUrl;
        return;
      }
      
      throw error;
    }
  };

  // Получить количество товаров в корзине (без загрузки с сервера)
  const getCartItemsCount = () => {
    return cartItems.length;
  };

  // Инициализация при загрузке
  useEffect(() => {
    // Пробуем загрузить из кэша
    const cachedCart = loadCartFromCache();
    if (!cachedCart) {
      // Если кэша нет, загружаем с сервера
      loadCart();
    }
  }, []);

  // Автоматическое обновление корзины каждые 10 минут
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('🔄 Автоматическое обновление корзины...');
      loadCart();
    }, CACHE_DURATION);

    return () => clearInterval(interval);
  }, []);

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      loading,
      networkError,
      isLoaded,
      addToCart, 
      updateCartItem,
      removeFromCart, 
      clearCart,
      loadCart,
      getCartItemsCount
    }}>
      {children}
    </CartContext.Provider>
  );
};
