// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import CategorySidebar from './components/CategorySidebar';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import CategoryPage from './pages/CategoryPage';
import ProfilePage from './pages/ProfilePage';
import OrdersPage from './pages/OrdersPage';
import AdminDashboard from './pages/AdminDashboard';
import './App.css';

// Компонент для условного рендеринга сайдбара
const AppContent = () => {
  const location = useLocation();
  const isCategoryPage = location.pathname.startsWith('/category/');

  return (
    <div className="flex-grow container mx-auto p-4">
      <div className="flex gap-6">
        {/* Сайдбар с категориями (не показывается на странице категории) */}
        {!isCategoryPage && (
          <div className="w-64 flex-shrink-0">
            <CategorySidebar />
          </div>
        )}
        
        {/* Основной контент */}
        <div className="flex-1">
          <Routes>
            {/* Открытые маршруты */}
            <Route path="/" element={<HomePage />} />
            <Route path="/category/:categoryId" element={<CategoryPage />} />
            <Route path="/product/:productId" element={<ProductPage />} />
            
            {/* Защищенные маршруты */}
            <Route path="/cart" element={
              <ProtectedRoute requireAuth={true}>
                <CartPage />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute requireAuth={true}>
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/orders" element={
              <ProtectedRoute requireAuth={true}>
                <OrdersPage />
              </ProtectedRoute>
            } />
            
            {/* Маршруты только для админов (пример) */}
            <Route path="/admin" element={
              <ProtectedRoute requireAuth={true} roles={['admin', 'Admin', 'ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <AppContent />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
