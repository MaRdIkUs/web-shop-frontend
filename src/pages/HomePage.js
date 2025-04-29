// src/pages/HomePage.js
import React, { useEffect, useState } from 'react';
import categoryService from '../services/categoryService';
import ProductService from '../services/productService';
import { Link } from 'react-router-dom';

const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts]   = useState([]);

  useEffect(() => {
    categoryService.getAll()
      .then(res => setCategories(res.data))
      .catch(err => console.error('Ошибка загрузки категорий', err));

    ProductService.getProducts()
      .then(res => setProducts(res.data))
      .catch(err => console.error('Ошибка загрузки товаров', err));
  }, []);

  return (
    <div>
      <h1>Главная</h1>
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Категории</h2>
        <ul className="flex space-x-4">
          {categories.map(cat => (
            <li key={cat.id}>
              <Link to={`/category/${cat.id}`} className="text-blue-600 hover:underline">
                {cat.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-4">Популярные товары</h2>
        <div className="grid grid-cols-3 gap-4">
          {products.map(p => (
            <div key={p.id} className="border p-4 rounded">
              <h3>{p.name}</h3>
              <p>{p.price} ₽</p>
              <Link to={`/product/${p.id}`} className="text-blue-500">Подробнее</Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
