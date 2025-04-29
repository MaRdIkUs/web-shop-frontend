import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';

const Navbar = () => {
  const { keycloak, user } = useAuth();
  const { cartItems } = useCart();

  const handleLogin = () => keycloak.login();
  const handleLogout = () => keycloak.logout();

  return (
    <nav className="bg-gray-800 p-4 text-white">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex space-x-4">
          <NavLink to="/" className="hover:underline">Главная</NavLink>
          <NavLink to="/category/1" className="hover:underline">Категории</NavLink>
        </div>
        <div className="flex space-x-4 items-center">
          {keycloak.authenticated ? (
            <>
              <span>Привет, {user?.username}</span>
              <button onClick={handleLogout}>Выйти</button>
            </>
          ) : (
            <button onClick={handleLogin}>Войти</button>
          )}
          <NavLink to="/cart" className="hover:underline">
            Корзина ({cartItems.length})
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;