import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import categoryService from '../services/categoryService';
import filterService from '../services/filterService';
import ProductFilters from '../components/ProductFilters';
import { formatPrice } from '../utils/format';
import { getProductImageUrl } from '../utils/imageUtils';
import ImageWithFallback from '../components/ImageWithFallback';

const CategoryPage = () => {
  const { categoryId } = useParams();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [filters, setFilters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [activeFilters, setActiveFilters] = useState({});

  useEffect(() => {
    const loadCategoryData = async () => {
      try {
        setLoading(true);
        
        // Загружаем категорию
        const categoriesResponse = await categoryService.getAll();
        const categoryData = categoriesResponse.data.find(cat => cat.id === Number(categoryId));
        setCategory(categoryData);
        
        // Загружаем фильтры для категории
        try {
          const filtersResponse = await filterService.getFiltersByCategory(categoryId);
          setFilters(filtersResponse.data || []);
        } catch (error) {
          console.warn('Не удалось загрузить фильтры:', error);
          setFilters([]);
        }
        
        // Загружаем продукты категории
        const productsResponse = await categoryService.getProductsByCategory(categoryId, searchTerm);
        setProducts(productsResponse.data);
      } catch (error) {
        console.error('Ошибка при загрузке категории', error);
      } finally {
        setLoading(false);
      }
    };

    loadCategoryData();
  }, [categoryId, searchTerm]);

  // Применяем фильтры к продуктам
  useEffect(() => {
    let filtered = [...products];

    // Применяем каждый активный фильтр
    Object.entries(activeFilters).forEach(([filterId, filterValue]) => {
      if (filterValue !== undefined && filterValue !== null && filterValue !== '') {
        const beforeCount = filtered.length;
        
        // Находим информацию о фильтре
        const filterInfo = filters.find(f => f.id == filterId);
        
        filtered = filtered.filter(product => {
          let matches = true;
          
          if (filterInfo) {
            // Применяем фильтр в зависимости от его типа
            switch (filterInfo.type) {
              case 0: // Checkbox (булевый фильтр)
                if (filterValue === true) {
                  // Для фильтра "В наличии" проверяем количество
                  if (filterInfo.name.toLowerCase().includes('наличие') || filterInfo.name.toLowerCase().includes('в наличии')) {
                    matches = product.count > 0;
                  } else {
                    // Для других булевых фильтров проверяем теги
                    matches = product.tags && product.tags.some(tag => 
                      tag.name.toLowerCase() === filterInfo.name.toLowerCase()
                    );
                  }
                }
                break;
                
              case 1: // Options (выпадающий список)
                if (typeof filterValue === 'string' && filterValue.trim()) {
                  // Проверяем теги продукта
                  const tagMatch = product.tags && product.tags.some(tag => 
                    tag.value === filterValue || tag.name === filterInfo.name
                  );
                  
                  // Проверяем характеристики продукта
                  const specMatch = product.specs && product.specs.some(spec => 
                    spec.value === filterValue || spec.name === filterInfo.name
                  );
                  
                  // Проверяем другие поля продукта
                  const fieldMatch = product[filterInfo.name.toLowerCase()] === filterValue ||
                                   product[filterInfo.name.toLowerCase().replace(/\s+/g, '')] === filterValue;
                  
                  matches = tagMatch || specMatch || fieldMatch;
                } else if (Array.isArray(filterValue) && filterValue.length > 0) {
                  // Множественный выбор
                  const tagMatch = product.tags && product.tags.some(tag => 
                    filterValue.includes(tag.value) || filterValue.includes(tag.name)
                  );
                  
                  const specMatch = product.specs && product.specs.some(spec => 
                    filterValue.includes(spec.value) || filterValue.includes(spec.name)
                  );
                  
                  const fieldMatch = filterValue.some(value => 
                    product[filterInfo.name.toLowerCase()] === value ||
                    product[filterInfo.name.toLowerCase().replace(/\s+/g, '')] === value
                  );
                  
                  matches = tagMatch || specMatch || fieldMatch;
                }
                break;
                
              case 2: // Range (диапазон)
                if (typeof filterValue === 'object' && (filterValue.min !== undefined || filterValue.max !== undefined)) {
                  const price = parseFloat(product.price) || 0;
                  const min = parseFloat(filterValue.min) || 0;
                  const max = parseFloat(filterValue.max) || Infinity;
                  
                  if (filterInfo.name.toLowerCase().includes('цена')) {
                    matches = price >= min && (max === Infinity || price <= max);
                  } else {
                    // Для других числовых полей
                    const value = parseFloat(product[filterInfo.name.toLowerCase()]) || 0;
                    matches = value >= min && (max === Infinity || value <= max);
                  }
                }
                break;
                
              case 3: // Text (текстовое поле)
                if (typeof filterValue === 'string' && filterValue.trim()) {
                  const searchText = filterValue.toLowerCase();
                  matches = product.name.toLowerCase().includes(searchText) ||
                           product.description.toLowerCase().includes(searchText) ||
                           (product.tags && product.tags.some(tag => 
                             tag.name.toLowerCase().includes(searchText) ||
                             tag.value.toLowerCase().includes(searchText)
                           )) ||
                           (product.specs && product.specs.some(spec => 
                             spec.name.toLowerCase().includes(searchText) ||
                             spec.value.toLowerCase().includes(searchText)
                           ));
                }
                break;
                
              default:
                matches = true;
            }
          } else {
            // Если информация о фильтре не найдена, применяем общую логику
            if (typeof filterValue === 'string' && filterValue.trim()) {
              const searchText = filterValue.toLowerCase();
              matches = product.name.toLowerCase().includes(searchText) ||
                       product.description.toLowerCase().includes(searchText) ||
                       (product.tags && product.tags.some(tag => 
                         tag.name.toLowerCase().includes(searchText) ||
                         tag.value.toLowerCase().includes(searchText)
                       ));
            } else if (Array.isArray(filterValue) && filterValue.length > 0) {
              // Множественный выбор
              matches = product.tags && product.tags.some(tag => 
                filterValue.some(value => 
                  tag.name.toLowerCase().includes(value.toLowerCase()) ||
                  tag.value.toLowerCase().includes(value.toLowerCase())
                )
              );
            } else if (typeof filterValue === 'object' && (filterValue.min !== undefined || filterValue.max !== undefined)) {
              const price = parseFloat(product.price) || 0;
              const min = parseFloat(filterValue.min) || 0;
              const max = parseFloat(filterValue.max) || Infinity;
              matches = price >= min && (max === Infinity || price <= max);
            } else if (typeof filterValue === 'boolean' && filterValue) {
              matches = product.count > 0;
            }
          }
          
          return matches;
        });
      }
    });

    setFilteredProducts(filtered);
  }, [products, activeFilters, filters]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchTerm(searchInput);
  };

  const handleFiltersChange = (filters) => {
    setActiveFilters(filters);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-lg">Загрузка категории...</div>
      </div>
    );
  }

  return (
    <div className="flex gap-6">
      {/* Боковая панель с фильтрами */}
      <div className="w-64 flex-shrink-0">
        <ProductFilters onFiltersChange={handleFiltersChange} />
      </div>
      
      {/* Основной контент */}
      <div className="flex-1">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-4">
            {category ? category.name : `Категория ${categoryId}`}
          </h1>
          
          {category && category.description && (
            <p className="text-gray-600 mb-4">{category.description}</p>
          )}
          
          {/* Поиск */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex max-w-md">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    setSearchTerm(searchInput);
                  }
                }}
                placeholder="Поиск товаров..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-colors"
              >
                Найти
              </button>
            </div>
          </form>
          
          {/* Информация о результатах */}
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-gray-600">
              Найдено товаров: {filteredProducts.length} из {products.length}
            </div>
            {Object.keys(activeFilters).length > 0 && (
              <div className="flex items-center gap-2">
                <div className="text-sm text-blue-600">
                  Применены фильтры
                </div>
                <button
                  onClick={() => setActiveFilters({})}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Очистить все
                </button>
              </div>
            )}
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {searchTerm || Object.keys(activeFilters).length > 0 
                ? 'Товары не найдены по заданным критериям' 
                : 'В данной категории пока нет товаров'
              }
            </p>
            {(searchTerm || Object.keys(activeFilters).length > 0) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSearchInput('');
                  setActiveFilters({});
                }}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Очистить фильтры
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 overflow-hidden">
                  <ImageWithFallback
                    product={product}
                    className="w-full h-full object-cover"
                    fallbackClassName="w-full h-full"
                  />
                </div>
                
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                    {product.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-blue-600">
                      {formatPrice(product.price)}
                    </span>
                    
                    <Link 
                      to={`/product/${product.id}`}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                    >
                      Подробнее
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;