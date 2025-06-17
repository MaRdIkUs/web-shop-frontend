import React, { useState, useEffect } from 'react';
import { useCart } from '../hooks/useCart';
import { formatPrice } from '../utils/format';

const CartPage = () => {
  const { cartItems, loading, networkError, removeFromCart, updateCartItem, clearCart, loadCart, isLoaded } = useCart();
  const [updating, setUpdating] = useState({});

  // Автоматически загружаем корзину при переходе на страницу
  useEffect(() => {
    if (!isLoaded) {
      console.log('🛒 Автоматически загружаем корзину при переходе на страницу...');
      loadCart();
    }
  }, [isLoaded, loadCart]);

  // Проверяем, что cartItems является массивом
  const safeCartItems = Array.isArray(cartItems) ? cartItems : [];

  const handleRemove = async (itemId) => {
    try {
      setUpdating(prev => ({ ...prev, [itemId]: true }));
      await removeFromCart(itemId);
    } catch (error) {
      console.error('Ошибка удаления:', error);
      alert(error.message || 'Ошибка при удалении товара');
    } finally {
      setUpdating(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      await handleRemove(itemId);
      return;
    }
    
    try {
      setUpdating(prev => ({ ...prev, [itemId]: true }));
      await updateCartItem(itemId, newQuantity);
    } catch (error) {
      console.error('Ошибка обновления количества:', error);
      alert(error.message || 'Ошибка при обновлении количества');
    } finally {
      setUpdating(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const handleClear = async () => {
    try {
      await clearCart();
    } catch (error) {
      console.error('Ошибка очистки корзины:', error);
      alert(error.message || 'Ошибка при очистке корзины');
    }
  };

  const total = safeCartItems.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-8">
          <div className="text-lg">Загрузка корзины...</div>
        </div>
      </div>
    );
  }

  if (networkError) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Корзина</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 text-lg mb-2">⚠️ Ошибка подключения к серверу</div>
          <p className="text-gray-600 mb-4">
            Не удалось загрузить корзину. Проверьте подключение к интернету и настройки API.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Корзина</h1>
      {safeCartItems.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">Корзина пуста</p>
        </div>
      ) : (
        <div>
          <div className="space-y-4">
            {safeCartItems.map(item => (
              <div key={item.id} className="border rounded-lg p-4 flex items-center justify-between bg-white shadow-sm">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{item.product?.name || item.name}</h3>
                  <p className="text-gray-600">{item.product?.description || item.description}</p>
                  <p className="text-lg font-medium text-blue-600">
                    {formatPrice(item.price || 0)} за шт.
                  </p>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleUpdateQuantity(item.id, (item.quantity || 0) - 1)}
                      disabled={updating[item.id]}
                      className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-medium">
                      {updating[item.id] ? '...' : (item.quantity || 0)}
                    </span>
                    <button
                      onClick={() => handleUpdateQuantity(item.id, (item.quantity || 0) + 1)}
                      disabled={updating[item.id]}
                      className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                    >
                      +
                    </button>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-semibold text-lg">
                      {formatPrice((item.price || 0) * (item.quantity || 0))}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => handleRemove(item.id)}
                    disabled={updating[item.id]}
                    className="text-red-500 hover:text-red-700 disabled:opacity-50 px-3 py-1 rounded border border-red-300 hover:bg-red-50"
                  >
                    {updating[item.id] ? '...' : 'Удалить'}
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 border-t pt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Итого:</h2>
              <span className="text-2xl font-bold text-blue-600">
                {formatPrice(total)}
              </span>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={handleClear}
                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
              >
                Очистить корзину
              </button>
              <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                Оформить заказ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;