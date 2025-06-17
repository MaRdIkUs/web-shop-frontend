import http from './http-common';

class CategoryService {
  // Получить все категории
  getAll() {
    return http.get('/categories/');
  }

  // Получить все продукты из категории с поиском
  getProductsByCategory(categoryId, search = '') {
    return http.get(`/categories/${categoryId}/products`, {
      params: { search }
    });
  }
}

const categoryService = new CategoryService();
export default categoryService;