import React, { useEffect, useState } from 'react';
import UserService from '../services/userService';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    UserService.getOrders()
      .then(response => {
        setOrders(response.data);
      })
      .catch(error => console.error('Ошибка при загрузке заказов', error));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Заказы</h1>
      <ul>
        {orders.map(order => (
          <li key={order.id} className="border p-2 mb-2">
            <p>Заказ №{order.id}</p>
            <p>Дата: {order.date}</p>
            {/* Детали заказа */}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OrdersPage;