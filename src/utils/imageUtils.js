import { getApiUrl } from '../services/http-common';

/**
 * Преобразует относительный путь изображения в полный URL
 * @param {string} imagePath - Относительный путь изображения
 * @returns {string} Полный URL изображения
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) {
    return null;
  }

  // Если путь уже является полным URL, возвращаем как есть
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // Если путь начинается с /api, убираем /api и добавляем базовый URL
  if (imagePath.startsWith('/api/')) {
    const baseUrl = getApiUrl().replace('/api', '');
    return `${baseUrl}${imagePath}`;
  }

  // Если путь начинается с /, добавляем базовый URL
  if (imagePath.startsWith('/')) {
    const baseUrl = getApiUrl().replace('/api', '');
    return `${baseUrl}${imagePath}`;
  }

  // Для остальных случаев добавляем базовый URL с /api
  return `${getApiUrl()}/${imagePath}`;
};

/**
 * Получает URL изображения из объекта продукта
 * @param {Object} product - Объект продукта
 * @returns {string|null} URL изображения или null
 */
export const getProductImageUrl = (product) => {
  if (!product) {
    return null;
  }

  // Проверяем поле images (множественное число)
  if (product.images) {
    // Если images - это массив, берем первое изображение
    if (Array.isArray(product.images)) {
      return product.images.length > 0 ? getImageUrl(product.images[0]) : null;
    }
    // Если images - это строка
    return getImageUrl(product.images);
  }

  // Проверяем поле image (единственное число)
  if (product.image) {
    return getImageUrl(product.image);
  }

  return null;
};

/**
 * Получает все URL изображений из объекта продукта
 * @param {Object} product - Объект продукта
 * @returns {Array} Массив URL изображений
 */
export const getProductImageUrls = (product) => {
  if (!product) {
    return [];
  }

  // Проверяем поле images (множественное число)
  if (product.images) {
    // Если images - это массив
    if (Array.isArray(product.images)) {
      return product.images.map(img => getImageUrl(img)).filter(Boolean);
    }
    // Если images - это строка
    return [getImageUrl(product.images)].filter(Boolean);
  }

  // Проверяем поле image (единственное число)
  if (product.image) {
    return [getImageUrl(product.image)].filter(Boolean);
  }

  return [];
};

/**
 * Проверяет, является ли путь изображения валидным
 * @param {string} imagePath - Путь изображения
 * @returns {boolean} true если путь валидный
 */
export const isValidImagePath = (imagePath) => {
  if (!imagePath) {
    return false;
  }

  const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const lowerPath = imagePath.toLowerCase();
  
  return validExtensions.some(ext => lowerPath.includes(ext));
}; 