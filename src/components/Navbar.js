import { NavLink } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { useCart } from '../hooks/useCart';
import UserService from '../services/userService';


const Navbar = () => {
  const { cartItems } = useCart();

  const [profile, setProfile] = useState(null);

  useEffect(() => {
    UserService.getProfile()
      .then(response => {
        setProfile(response.data);
      })
      .catch(error => console.error('Ошибка при загрузке профиля', error));
  }, []);


  return (
    <nav className="bg-gray-800 p-4 text-white">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex space-x-4">
          <NavLink to="/" className="hover:underline">Главная</NavLink>
          <NavLink to="/category/1" className="hover:underline">Категории</NavLink>
        </div>
        <div className="flex space-x-4 items-center">
            <>
              <span>Привет, {profile?.username}</span>
              <button onClick={()=>{UserService.logout()}}>Выйти</button>
            </>
            <button onClick={()=>{UserService.login()}}>Войти</button>
          <NavLink to="/cart" className="hover:underline">
            Корзина ({cartItems.length})
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;