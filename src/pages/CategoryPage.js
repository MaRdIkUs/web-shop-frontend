import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ProductService from '../services/productService';
import { formatPrice } from '../utils/format';

const CategoryPage = () => {
  const { categoryId } = useParams();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    ProductService.getProducts()
      .then(response => {
        const allProducts = response.data;
        // Фильтруем товары по категории
        const filtered = allProducts.filter(p => p.categoryId === Number(categoryId));
        setProducts(filtered);
      })
      .catch(error => console.error('Ошибка при загрузке категории', error));
  }, [categoryId]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Категория {categoryId}</h1>
      <div className="grid grid-cols-3 gap-4">
        {products.map(product => (
          <div key={product.id} className="border p-4 rounded shadow">
            <h2 className="text-lg">{product.name}</h2>
            <p>{formatPrice(product.price)}</p>
            <Link to={`/product/${product.id}`} className="text-blue-500 hover:underline">
              Подробнее
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryPage;