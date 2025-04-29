import http from './http-common';

class CategoryService {
  getAll() {
    return http.get('/categories');
  }
}

const categoryService = new CategoryService();
export default categoryService;