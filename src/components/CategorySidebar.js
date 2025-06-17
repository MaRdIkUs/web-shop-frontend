import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import categoryService from '../services/categoryService';

const CategorySidebar = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await categoryService.getAll();
      setCategories(response.data);
    } catch (error) {
      console.error('Ошибка загрузки категорий', error);
      setError('Не удалось загрузить категории. Проверьте подключение к серверу.');
      
      // Fallback: show some default categories if API is not available
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        setCategories([
          { id: 1, name: 'Электроника', slug: 'electronics' },
          { id: 2, name: 'Одежда', slug: 'clothing' },
          { id: 3, name: 'Книги', slug: 'books' },
          { id: 4, name: 'Спорт', slug: 'sports' }
        ]);
        setError('Используются демо-данные. Сервер недоступен.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  if (loading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Категории</h3>
        <div className="space-y-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Категории</h3>
      
      {error && (
        <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
          <p className="text-sm">{error}</p>
          <button 
            onClick={loadCategories}
            className="mt-2 text-xs underline hover:no-underline"
          >
            Попробовать снова
          </button>
        </div>
      )}
      
      <nav className="space-y-2">
        {categories.map(category => {
          const isActive = location.pathname === `/category/${category.id}`;
          return (
            <Link
              key={category.id}
              to={`/category/${category.id}`}
              className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                isActive
                  ? 'bg-blue-100 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              {category.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default CategorySidebar; 