import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import adminService from '../../services/adminService';
import CategoryForm from './CategoryForm';

const CategoryManager = () => {
  const { apiCall, loading, error } = useApi();
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await apiCall(adminService.getAllCategories);
      setCategories(response.data || []);
    } catch (error) {
      console.error('Ошибка загрузки категорий:', error);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleDelete = async (categoryId) => {
    if (window.confirm('Вы уверены, что хотите удалить эту категорию?')) {
      try {
        await apiCall(adminService.deleteCategory, categoryId);
        await loadCategories(); // Перезагружаем список
        alert('Категория успешно удалена');
      } catch (error) {
        console.error('Ошибка удаления категории:', error);
        alert('Ошибка при удалении категории');
      }
    }
  };

  const handleFormSave = async () => {
    await loadCategories(); // Перезагружаем список после сохранения
    setShowForm(false);
    setEditingCategory(null);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingCategory(null);
  };

  const getFilterTypeName = (type) => {
    const types = {
      0: 'Чекбокс',
      1: 'Выпадающий список',
      2: 'Диапазон',
      3: 'Текстовое поле'
    };
    return types[type] || 'Неизвестно';
  };

  if (showForm) {
    return (
      <CategoryForm
        category={editingCategory}
        onSave={handleFormSave}
        onCancel={handleFormCancel}
      />
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Управление категориями</h2>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Создать категорию
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка категорий...</p>
        </div>
      ) : error ? (
        <div className="text-red-600 text-center py-8">
          Ошибка загрузки: {error}
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Категории не найдены
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Название
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Описание
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Фильтры
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {category.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {category.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {category.description || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {category.filters && category.filters.length > 0 ? (
                      <div className="space-y-1">
                        {category.filters.slice(0, 2).map((filter) => (
                          <div key={filter.id} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {filter.name} ({getFilterTypeName(filter.type)})
                          </div>
                        ))}
                        {category.filters.length > 2 && (
                          <div className="text-xs text-gray-500">
                            +{category.filters.length - 2} еще
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">Нет фильтров</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Изменить
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Удалить
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CategoryManager; 