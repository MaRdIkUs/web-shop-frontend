import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import adminService from '../../services/adminService';
import categoryService from '../../services/categoryService';
import { getImageUrl } from '../../utils/imageUtils';

const ProductForm = ({ product, onSave, onCancel }) => {
  const { apiCall, loading, error } = useApi();
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    count: '',
    tags: [],
    specs: []
  });
  const [tagForm, setTagForm] = useState({ name: '', value: '' });
  const [specForm, setSpecForm] = useState({ name: '', value: '' });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    loadCategories();
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        categoryId: product.categoryId || '',
        count: product.count || '',
        tags: product.tags || [],
        specs: product.specs || []
      });
      if (product.image) {
        setImagePreview(product.image);
      }
    }
  }, [product]);

  const loadCategories = async () => {
    try {
      const response = await categoryService.getAll();
      setCategories(response.data);
    } catch (error) {
      console.error('Ошибка загрузки категорий:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTagInputChange = (e) => {
    const { name, value } = e.target;
    setTagForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSpecInputChange = (e) => {
    const { name, value } = e.target;
    setSpecForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addTag = (e) => {
    e.preventDefault();
    console.log('addTag вызвана', { tagForm, formData });
    if (tagForm.name.trim() && tagForm.value.trim()) {
      setFormData(prev => {
        const newData = {
          ...prev,
          tags: [...prev.tags, { ...tagForm, id: Date.now() }]
        };
        console.log('Новые данные формы:', newData);
        return newData;
      });
      setTagForm({ name: '', value: '' });
    } else {
      console.log('Тег не добавлен - пустые поля:', { name: tagForm.name, value: tagForm.value });
    }
  };

  const removeTag = (tagId) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t.id !== tagId)
    }));
  };

  const addSpec = (e) => {
    e.preventDefault();
    console.log('addSpec вызвана', { specForm, formData });
    if (specForm.name.trim() && specForm.value.trim()) {
      setFormData(prev => {
        const newData = {
          ...prev,
          specs: [...prev.specs, { ...specForm, id: Date.now() }]
        };
        console.log('Новые данные формы:', newData);
        return newData;
      });
      setSpecForm({ name: '', value: '' });
    } else {
      console.log('Характеристика не добавлена - пустые поля:', { name: specForm.name, value: specForm.value });
    }
  };

  const removeSpec = (specId) => {
    setFormData(prev => ({
      ...prev,
      specs: prev.specs.filter(s => s.id !== specId)
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Очищаем данные от временных ID перед отправкой
      const cleanFormData = {
        ...formData,
        tags: formData.tags.map(tag => {
          const { id, ...cleanTag } = tag;
          return cleanTag;
        }),
        specs: formData.specs.map(spec => {
          const { id, ...cleanSpec } = spec;
          return cleanSpec;
        })
      };
      
      let savedProduct;
      
      if (product) {
        savedProduct = await apiCall(adminService.updateProduct, product.id, cleanFormData);
      } else {
        savedProduct = await apiCall(adminService.createProduct, cleanFormData);
      }
      
      // Загружаем изображение если выбрано
      if (selectedImage && savedProduct?.data?.id) {
        console.log('Загружаем изображение для продукта:', savedProduct.data.id);
        try {
          const imageResponse = await adminService.uploadProductImage(
            formData.categoryId, 
            savedProduct.data.id, 
            selectedImage
          );
          console.log('Изображение успешно загружено:', imageResponse);
          
          // Обновляем продукт с путем к изображению
          if (imageResponse?.data?.filePath) {
            const updateData = {
              ...cleanFormData,
              image: imageResponse.data.filePath
            };
            
            await apiCall(adminService.updateProduct, savedProduct.data.id, updateData);
            console.log('Продукт обновлен с путем к изображению');
          }
        } catch (imageError) {
          console.error('Ошибка загрузки изображения:', imageError);
        }
      }
      
      if (onSave) {
        onSave();
      }
    } catch (error) {
      console.error('Ошибка сохранения продукта:', error);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">
        {product ? 'Редактировать продукт' : 'Создать продукт'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Основные поля */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Название продукта *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Введите название продукта"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Категория *
            </label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Выберите категорию</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Описание
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Введите описание продукта"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Цена *
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              required
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Количество на складе *
            </label>
            <input
              type="number"
              name="count"
              value={formData.count}
              onChange={handleInputChange}
              required
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
            />
          </div>
        </div>

        {/* Изображение */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Изображение продукта
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {imagePreview && (
            <div className="mt-4">
              <img
                src={getImageUrl(imagePreview)}
                alt="Предварительный просмотр"
                className="w-32 h-32 object-cover rounded border"
              />
            </div>
          )}
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
            {loading ? 'Сохранение...' : (product ? 'Обновить' : 'Создать')}
          </button>
        </div>

        {error && (
          <div className="text-red-600 text-sm">
            Ошибка: {error}
          </div>
        )}
      </form>

      {/* Теги - вне формы */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Теги</h3>
        
        <div className="bg-gray-50 p-4 rounded-md mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Название тега
              </label>
              <input
                type="text"
                name="name"
                value={tagForm.name}
                onChange={handleTagInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Например: Новинка, Популярный"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Значение тега
              </label>
              <input
                type="text"
                name="value"
                value={tagForm.value}
                onChange={handleTagInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="true, false или произвольное значение"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={addTag}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            Добавить тег
          </button>
        </div>

        {formData.tags.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Добавленные теги:</h4>
            {formData.tags.map((tag) => (
              <div key={tag.id} className="flex items-center justify-between bg-blue-50 p-3 rounded">
                <div>
                  <span className="font-medium">{tag.name}</span>
                  <span className="text-sm text-gray-600 ml-2">
                    = {tag.value}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeTag(tag.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Удалить
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Спецификации - вне формы */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Спецификации</h3>
        
        <div className="bg-gray-50 p-4 rounded-md mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Название характеристики
              </label>
              <input
                type="text"
                name="name"
                value={specForm.name}
                onChange={handleSpecInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Например: Вес, Размер, Материал"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Значение характеристики
              </label>
              <input
                type="text"
                name="value"
                value={specForm.value}
                onChange={handleSpecInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Например: 500г, XL, Хлопок"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={addSpec}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            Добавить характеристику
          </button>
        </div>

        {formData.specs.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Добавленные характеристики:</h4>
            {formData.specs.map((spec) => (
              <div key={spec.id} className="flex items-center justify-between bg-green-50 p-3 rounded">
                <div>
                  <span className="font-medium">{spec.name}</span>
                  <span className="text-sm text-gray-600 ml-2">
                    = {spec.value}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeSpec(spec.id)}
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

export default ProductForm; 