import React, { useState } from 'react';
import { getProductImageUrl } from '../utils/imageUtils';

const ImageWithFallback = ({ product, alt, className, fallbackClassName, ...props }) => {
  const [imageError, setImageError] = useState(false);
  const imageUrl = getProductImageUrl(product);

  if (!imageUrl || imageError) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${fallbackClassName || className}`}>
        <span className="text-gray-500 text-sm">Нет фото</span>
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={alt || product?.name || 'Изображение продукта'}
      className={className}
      onError={() => setImageError(true)}
      {...props}
    />
  );
};

export default ImageWithFallback; 