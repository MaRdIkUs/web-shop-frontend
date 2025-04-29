import React from 'react';
import { useCart } from '../hooks/useCart';
import { formatPrice } from '../utils/format';

const CartPage = () => {
  const { cartItems, removeFromCart, clearCart } = useCart();

  const handleRemove = (id) => {
    removeFromCart(id);
  };

  const handleClear = () => {
    clearCart();
  };

  const total = cartItems.reduce((sum, item) => sum + item.price, 0);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Корзина</h1>
      {cartItems.length === 0 ? (
        <p>Корзина пуста</p>
      ) : (
        <div>
          <ul>
            {cartItems.map(item => (
              <li key={item.id} className="border p-2 mb-2 flex justify-between">
                <span>{item.name} – {formatPrice(item.price)}</span>
                <button onClick={() => handleRemove(item.id)} className="text-red-500">
                  Удалить
                </button>
              </li>
            ))}
          </ul>
          <p className="font-bold mt-4">Итого: {formatPrice(total)}</p>
          <button onClick={handleClear} className="mt-2 px-4 py-2 bg-gray-200">
            Очистить корзину
          </button>
        </div>
      )}
    </div>
  );
};

export default CartPage;