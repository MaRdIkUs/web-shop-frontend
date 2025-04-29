import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ProductService from '../services/productService';
import { useCart } from '../hooks/useCart';
import { formatPrice } from '../utils/format';

const ProductPage = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    ProductService.getProduct(productId)
      .then(response => {
        setProduct(response.data);
      })
      .catch(error => console.error('Ошибка при загрузке товара', error));
  }, [productId]);

  if (!product) return <div>Загрузка...</div>;

  const handleAdd = () => {
    addToCart(product);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{product.name}</h1>
      <p className="mb-2">{product.description}</p>
      <p className="text-xl mb-4">{formatPrice(product.price)}</p>
      <button onClick={handleAdd} className="bg-blue-500 text-white px-4 py-2 rounded">
        Добавить в корзину
      </button>
    </div>
  );
};

export default ProductPage;
