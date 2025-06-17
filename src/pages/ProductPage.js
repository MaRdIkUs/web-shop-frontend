import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ProductService from '../services/productService';
import { useCart } from '../hooks/useCart';
import { formatPrice } from '../utils/format';
import ImageWithFallback from '../components/ImageWithFallback';
import DebugImageInfo from '../components/DebugImageInfo';

const ProductPage = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        const response = await ProductService.getProduct(productId);
        setProduct(response.data);
      } catch (error) {
        console.error('Ошибка при загрузке товара', error);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [productId]);

  const handleAddToCart = async () => {
    try {
      setAddingToCart(true);
      await addToCart(productId, quantity);
      alert('Товар добавлен в корзину!');
    } catch (error) {
      console.error('Ошибка добавления в корзину:', error);
      alert('Ошибка при добавлении в корзину');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-lg">Загрузка товара...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-8">
        <h1 className="text-xl text-red-600">Товар не найден</h1>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <DebugImageInfo product={product} />
      
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/2 p-6">
            <ImageWithFallback
              product={product}
              className="w-full h-64 object-cover rounded-lg"
              fallbackClassName="w-full h-64 rounded-lg"
            />
          </div>
          
          <div className="md:w-1/2 p-6">
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
            
            <div className="mb-6">
              <p className="text-gray-600 text-lg leading-relaxed">
                {product.description}
              </p>
            </div>
            
            <div className="mb-6">
              <span className="text-3xl font-bold text-blue-600">
                {formatPrice(product.price)}
              </span>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Количество:
              </label>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                >
                  -
                </button>
                <span className="w-16 text-center text-lg font-medium">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>
            
            <button
              onClick={handleAddToCart}
              disabled={addingToCart}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              {addingToCart ? 'Добавление...' : 'Добавить в корзину'}
            </button>
            
            {product.category && (
              <div className="mt-4 text-sm text-gray-500">
                Категория: {product.category.name}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
