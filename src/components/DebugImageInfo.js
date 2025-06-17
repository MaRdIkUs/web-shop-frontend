import React from 'react';
import { getProductImageUrl, getProductImageUrls } from '../utils/imageUtils';

const DebugImageInfo = ({ product }) => {
  if (!product) {
    return <div className="text-red-500">Продукт не загружен</div>;
  }

  const imageUrl = getProductImageUrl(product);
  const allImageUrls = getProductImageUrls(product);

  return (
    <div className="bg-gray-100 p-4 rounded text-xs">
      <h4 className="font-bold mb-2">Отладочная информация об изображениях:</h4>
      <div className="space-y-1">
        <div><strong>ID продукта:</strong> {product.id}</div>
        <div><strong>Название:</strong> {product.name}</div>
        <div><strong>Поле image:</strong> {product.image || 'не задано'}</div>
        <div><strong>Поле images:</strong> {product.images || 'не задано'}</div>
        <div><strong>Тип images:</strong> {Array.isArray(product.images) ? 'массив' : typeof product.images}</div>
        <div><strong>Основной URL:</strong> {imageUrl || 'не найден'}</div>
        <div><strong>Все URL:</strong> {allImageUrls.length > 0 ? allImageUrls.join(', ') : 'не найдены'}</div>
      </div>
    </div>
  );
};

export default DebugImageInfo; 