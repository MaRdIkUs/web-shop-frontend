import http from './http-common';

class ProductService {
  getProducts() { return http.get('/products'); }
  getProduct(id) { return http.get(`/products/${id}`); }
}

const productService = new ProductService();
export default productService;