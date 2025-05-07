// src/App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';

import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import ProductPage from './pages/ProductPage';
import ProfilePage from './pages/ProfilePage';
import OrdersPage from './pages/OrdersPage';
import CartPage from './pages/CartPage';

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow container mx-auto p-4">
        <Routes>
          {/* Открытые маршруты */}
          <Route path="/" element={<HomePage />} />
          <Route path="/category/:categoryId" element={<CategoryPage />} />
          <Route path="/product/:productId" element={<ProductPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/cart" element={<CartPage />} />

          {/* <Route element={<PrivateRoute roles={['user', 'admin']} />}>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/orders" element={<OrdersPage />} />
          </Route>

          <Route element={<PrivateRoute roles={['user', 'admin']} />}>
            <Route path="/cart" element={<CartPage />} />
          </Route> */}
        </Routes>
      </div>
    </div>
  );
}

export default App;
