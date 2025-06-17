import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import adminService from '../../services/adminService';

const CategoryForm = ({ category, onSave, onCancel }) => {
  const { apiCall, loading, error } = useApi();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    filters: []
  });
  const [filterForm, setFilterForm] = useState({
    name: '',
    type: 0,
    value: '',
    defaultValue: ''
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        description: category.description || '',
        filters: category.filters || []
      });
    }
  }, [category]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFilterInputChange = (e) => {
    const { name, value } = e.target;
    setFilterForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addFilter = (e) => {
    e.preventDefault();
    console.log('addFilter вызвана', { filterForm, formData });
    if (filterForm.name.trim()) {
      setFormData(prev => {
        const newData = {
          ...prev,
          filters: [...prev.filters, { ...filterForm, id: Date.now() }]
        };
        console.log('Новые данные формы:', newData);
        return newData;
      });
      setFilterForm({
        name: '',
        type: 0,
        value: '',
        defaultValue: ''
      });
    } else {
      console.log('Фильтр не добавлен - пустое название:', { name: filterForm.name });
    }
  };

  const removeFilter = (filterId) => {
    setFormData(prev => ({
      ...prev,
      filters: prev.filters.filter(f => f.id !== filterId)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Очищаем данные от временных ID перед отправкой
      const cleanFormData = {
        ...formData,
        filters: formData.filters.map(filter => {
          const { id, ...cleanFilter } = filter;
          return cleanFilter;
        })
      };
      
      if (category) {
        await apiCall(adminService.updateCategory, category.id, cleanFormData);
      } else {
        await apiCall(adminService.createCategory, cleanFormData);
      }
      
      if (onSave) {
        onSave();
      }
    } catch (error) {
      console.error('Ошибка сохранения категории:', error);
    }
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

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">
        {category ? 'Редактировать категорию' : 'Создать категорию'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Основные поля категории */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Название категории *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Введите название категории"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Описание
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Введите описание категории"
          />
        </div>

        {/* Кнопки */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Сохранение...' : (category ? 'Обновить' : 'Создать')}
          </button>
        </div>

        {error && (
          <div className="text-red-600 text-sm">
            Ошибка: {error}
          </div>
        )}
      </form>

      {/* Фильтры - вне формы */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Фильтры</h3>
        
        {/* Форма добавления фильтра */}
        <div className="bg-gray-50 p-4 rounded-md mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Название фильтра
              </label>
              <input
                type="text"
                name="name"
                value={filterForm.name}
                onChange={handleFilterInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Например: Бренд, Цена, Цвет"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Тип фильтра
              </label>
              <select
                name="type"
                value={filterForm.type}
                onChange={handleFilterInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={0}>Чекбокс</option>
                <option value={1}>Выпадающий список</option>
                <option value={2}>Диапазон</option>
                <option value={3}>Текстовое поле</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Значения (для списка: через запятую, для диапазона: мин-макс)
              </label>
              <input
                type="text"
                name="value"
                value={filterForm.value}
                onChange={handleFilterInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Apple,Samsung,Xiaomi или 1000-50000"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Значение по умолчанию
              </label>
              <input
                type="text"
                name="defaultValue"
                value={filterForm.defaultValue}
                onChange={handleFilterInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Необязательно"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={addFilter}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            Добавить фильтр
          </button>
        </div>

        {/* Список добавленных фильтров */}
        {formData.filters.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Добавленные фильтры:</h4>
            {formData.filters.map((filter, index) => (
              <div key={filter.id} className="flex items-center justify-between bg-blue-50 p-3 rounded">
                <div>
                  <span className="font-medium">{filter.name}</span>
                  <span className="text-sm text-gray-600 ml-2">
                    ({getFilterTypeName(filter.type)})
                  </span>
                  {filter.value && (
                    <span className="text-sm text-gray-500 ml-2">
                      Значения: {filter.value}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeFilter(filter.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Удалить
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryForm; 