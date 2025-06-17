import http from './http-common';

class ProductService {
  // Получить все товары с фильтрацией
  getAllProducts(params = {}) {
    return http.get('/products', { params });
  }

  // Получить товар по id
  getProduct(id) { 
    return http.get(`/products/${id}`); 
  }
}

const productService = new ProductService();
export default productService;