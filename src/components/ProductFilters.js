import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import filterService from '../services/filterService';
import { useApi } from '../hooks/useApi';

const ProductFilters = ({ onFiltersChange }) => {
  const { categoryId } = useParams();
  const { apiCall, loading, error } = useApi();
  const [filters, setFilters] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState({});
  const [validationErrors, setValidationErrors] = useState([]);

  // Загружаем фильтры при изменении категории
  useEffect(() => {
    if (categoryId) {
      loadFilters();
    }
  }, [categoryId]);

  const loadFilters = async () => {
    try {
      setValidationErrors([]); // Очищаем предыдущие ошибки
      const response = await apiCall(filterService.getFiltersByCategory, categoryId);
      
      if (response && response.data) {
        // Валидируем данные фильтров
        const errors = [];
        const validFilters = response.data.filter(filter => {
          if (!filter.id || filter.type === undefined || !filter.name) {
            errors.push(`Некорректный фильтр: ${JSON.stringify(filter)}`);
            return false;
          }
          
          // Автоматически исправляем тип фильтра на основе названия и значений
          let correctedType = filter.type;
          if (filter.name.toLowerCase().includes('бренд') ||
              filter.name.toLowerCase().includes('цвет') || 
              filter.name.toLowerCase().includes('размер') ||
              filter.name.toLowerCase().includes('модель') ||
              (filter.value && filter.value.includes(','))) {
            correctedType = 1; // Options
          } else if (filter.name.toLowerCase().includes('цена') || 
                     filter.name.toLowerCase().includes('вес') ||
                     filter.name.toLowerCase().includes('размер экрана') ||
                     (filter.value && filter.value.includes('-'))) {
            correctedType = 2; // Range
          } else if (filter.name.toLowerCase().includes('поиск') ||
                     filter.name.toLowerCase().includes('название') ||
                     filter.name.toLowerCase().includes('описание')) {
            correctedType = 3; // Text
          } else if (filter.name.toLowerCase().includes('наличие') ||
                     filter.name.toLowerCase().includes('скидка') ||
                     filter.name.toLowerCase().includes('новинка')) {
            correctedType = 0; // Checkbox
          }
          
          // Применяем исправленный тип
          if (correctedType !== filter.type) {
            filter.type = correctedType;
          }
          
          // Проверяем корректность типа
          if (![0, 1, 2, 3].includes(filter.type)) {
            errors.push(`Неизвестный тип фильтра: ${filter.type} для фильтра: ${filter.name}`);
            return false;
          }
          
          // Проверяем корректность данных для разных типов
          if (filter.type === 1 && !filter.value) {
            errors.push(`Фильтр типа Options должен иметь значение: ${filter.name}`);
            return false;
          }
          
          if (filter.type === 2 && !filter.value) {
            errors.push(`Фильтр типа Range должен иметь значение: ${filter.name}`);
            return false;
          }
          
          return true;
        });
        
        setValidationErrors(errors);
        setFilters(validFilters);
        
        // Инициализируем значения фильтров по умолчанию
        const defaultValues = {};
        validFilters.forEach(filter => {
          if (filter.defaultValue) {
            defaultValues[filter.id] = filter.defaultValue;
          }
        });
        setSelectedFilters(defaultValues);
        
        // Уведомляем родительский компонент об изменении фильтров
        if (onFiltersChange && Object.keys(defaultValues).length > 0) {
          onFiltersChange(defaultValues);
        }
      } else {
        setFilters([]);
      }
    } catch (error) {
      setFilters([]);
    }
  };

  const handleFilterChange = (filterId, value) => {
    const newFilters = { ...selectedFilters };
    
    // Удаляем фильтр если значение пустое
    if (value === '' || value === null || value === undefined) {
      delete newFilters[filterId];
    } else {
      newFilters[filterId] = value;
    }
    
    setSelectedFilters(newFilters);
    
    // Уведомляем родительский компонент об изменении фильтров
    if (onFiltersChange) {
      onFiltersChange(newFilters);
    }
  };

  const handleCheckboxChange = (filterId, checked) => {
    const newFilters = { ...selectedFilters };
    if (checked) {
      newFilters[filterId] = true;
    } else {
      delete newFilters[filterId];
    }
    setSelectedFilters(newFilters);
    
    if (onFiltersChange) {
      onFiltersChange(newFilters);
    }
  };

  const handleRangeChange = (filterId, minValue, maxValue) => {
    const newFilters = { ...selectedFilters };
    
    // Удаляем фильтр если оба значения пустые
    if ((!minValue || minValue === '') && (!maxValue || maxValue === '')) {
      delete newFilters[filterId];
    } else {
      newFilters[filterId] = { 
        min: minValue || '', 
        max: maxValue || '' 
      };
    }
    
    setSelectedFilters(newFilters);
    
    if (onFiltersChange) {
      onFiltersChange(newFilters);
    }
  };

  const clearFilters = () => {
    setSelectedFilters({});
    if (onFiltersChange) {
      onFiltersChange({});
    }
  };

  const renderFilter = (filter) => {
    switch (filter.type) {
      case 0: // Checkbox
        return (
          <div key={filter.id} className="mb-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedFilters[filter.id] || false}
                onChange={(e) => handleCheckboxChange(filter.id, e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{filter.name}</span>
            </label>
          </div>
        );

      case 1: // Options
        const options = filter.value ? filter.value.split(',').map(opt => opt.trim()) : [];
        const selectedOptions = selectedFilters[filter.id] || [];
        const allSelected = options.length > 0 && selectedOptions.length === options.length;
        
        return (
          <div key={filter.id} className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                {filter.name}
              </label>
              {options.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    if (allSelected) {
                      handleFilterChange(filter.id, '');
                    } else {
                      handleFilterChange(filter.id, options);
                    }
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  {allSelected ? 'Снять все' : 'Выбрать все'}
                </button>
              )}
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {options.map((option, index) => (
                <label key={index} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedOptions.includes(option)}
                    onChange={(e) => {
                      const currentValues = selectedOptions;
                      let newValues;
                      
                      if (e.target.checked) {
                        newValues = [...currentValues, option];
                      } else {
                        newValues = currentValues.filter(val => val !== option);
                      }
                      
                      handleFilterChange(filter.id, newValues.length > 0 ? newValues : '');
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 2: // Range
        const rangeValues = filter.value ? filter.value.split('-').map(v => parseInt(v.trim())) : [0, 100];
        const [min, max] = rangeValues;
        return (
          <div key={filter.id} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {filter.name}
            </label>
            <div className="space-y-2">
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="От"
                  min={min}
                  max={max}
                  value={selectedFilters[filter.id]?.min || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    const currentMax = selectedFilters[filter.id]?.max || '';
                    if (value && currentMax && parseFloat(value) > parseFloat(currentMax)) {
                      handleRangeChange(filter.id, value, '');
                    } else {
                      handleRangeChange(filter.id, value, currentMax);
                    }
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="number"
                  placeholder="До"
                  min={min}
                  max={max}
                  value={selectedFilters[filter.id]?.max || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    const currentMin = selectedFilters[filter.id]?.min || '';
                    if (value && currentMin && parseFloat(value) < parseFloat(currentMin)) {
                      handleRangeChange(filter.id, '', value);
                    } else {
                      handleRangeChange(filter.id, currentMin, value);
                    }
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="text-xs text-gray-500">
                Диапазон: {min} - {max}
              </div>
            </div>
          </div>
        );

      case 3: // Text
        return (
          <div key={filter.id} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {filter.name}
            </label>
            <input
              type="text"
              placeholder={filter.defaultValue || 'Введите значение...'}
              value={selectedFilters[filter.id] || ''}
              onChange={(e) => handleFilterChange(filter.id, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Фильтры</h3>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Фильтры</h3>
        <div className="text-red-600 text-sm">
          Ошибка загрузки фильтров: {error}
        </div>
      </div>
    );
  }

  if (filters.length === 0) {
    return (
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Фильтры</h3>
        <div className="text-gray-500 text-sm">
          Фильтры не найдены для данной категории
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Фильтры</h3>
        <button
          onClick={clearFilters}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Очистить
        </button>
      </div>
      
      <div className="space-y-4">
        {filters.map(renderFilter)}
      </div>
      
      {/* Отображение активных фильтров */}
      {Object.keys(selectedFilters).length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <div className="text-sm text-gray-600 mb-2">Активные фильтры:</div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(selectedFilters).map(([filterId, value]) => {
              const filter = filters.find(f => f.id == filterId);
              if (!filter) return null;
              
              let displayValue = '';
              if (typeof value === 'object' && value.min !== undefined && value.max !== undefined) {
                if (value.min && value.max) {
                  displayValue = `${value.min} - ${value.max}`;
                } else if (value.min) {
                  displayValue = `от ${value.min}`;
                } else if (value.max) {
                  displayValue = `до ${value.max}`;
                }
              } else if (typeof value === 'boolean') {
                displayValue = filter.name;
              } else if (Array.isArray(value)) {
                displayValue = value.join(', ');
              } else {
                displayValue = value;
              }
              
              return (
                <span
                  key={filterId}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                >
                  {filter.name}: {displayValue}
                  <button
                    onClick={() => handleFilterChange(filterId, '')}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductFilters; 