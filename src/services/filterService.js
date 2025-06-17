import http from './http-common';

class FilterService {
    // Получить фильтры для категории
    getFiltersByCategory(categoryId) {
        return http.get(`/categories/${categoryId}/filters`);
    }
}

const filterService = new FilterService();
export default filterService; 