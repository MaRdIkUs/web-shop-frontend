import http from './http-common';

class AdminService {
  // Статистика и дашборд
  getAdminStats() {
    return http.get('/admin/stats');
  }

  // Категории
  getAllCategories(params = {}) {
    return http.get('/admin/categories', { params });
  }

  createCategory(categoryData) {
    return http.post('/admin/categories', categoryData);
  }

  updateCategory(categoryId, categoryData) {
    return http.put(`/admin/categories/${categoryId}`, categoryData);
  }

  deleteCategory(categoryId) {
    return http.delete(`/admin/categories/${categoryId}`);
  }

  // Фильтры
  getAllFilters(params = {}) {
    return http.get('/admin/filters', { params });
  }

  createFilter(filterData) {
    return http.post('/admin/filters', filterData);
  }

  updateFilter(filterId, filterData) {
    return http.put(`/admin/filters/${filterId}`, filterData);
  }

  deleteFilter(filterId) {
    return http.delete(`/admin/filters/${filterId}`);
  }

  // Продукты
  getAllProducts(params = {}) {
    return http.get('/admin/products', { params });
  }

  createProduct(productData) {
    return http.post('/admin/products', productData);
  }

  updateProduct(productId, productData) {
    return http.put(`/admin/products/${productId}`, productData);
  }

  deleteProduct(productId) {
    return http.delete(`/admin/products/${productId}`);
  }

  uploadProductImage(categoryId, productId, imageFile) {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('categoryId', categoryId);
    formData.append('productId', productId);
    
    return http.post(`/images/upload/category/${categoryId}/product/${productId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  updateProductImage(productId, imageFile) {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    return http.put(`/admin/products/${productId}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Заказы
  getAllOrders(params = {}) {
    return http.get('/admin/orders', { params });
  }

  updateOrderStatus(orderId, statusData) {
    return http.put(`/admin/orders/${orderId}/status`, statusData);
  }

  // Пользователи
  getAllUsers(params = {}) {
    return http.get('/admin/users', { params });
  }

  updateUserStatus(userId, statusData) {
    return http.put(`/admin/users/${userId}/status`, statusData);
  }

  // Дополнительные методы для работы с данными
  getCategoryById(categoryId) {
    return http.get(`/admin/categories/${categoryId}`);
  }

  getProductById(productId) {
    return http.get(`/admin/products/${productId}`);
  }

  getOrderById(orderId) {
    return http.get(`/admin/orders/${orderId}`);
  }

  getUserById(userId) {
    return http.get(`/admin/users/${userId}`);
  }

  // Методы для массовых операций
  bulkUpdateCategories(categoriesData) {
    return http.put('/admin/categories/bulk', categoriesData);
  }

  bulkDeleteCategories(categoryIds) {
    return http.delete('/admin/categories/bulk', { data: { categoryIds } });
  }

  // Методы для экспорта данных
  exportCategories(format = 'csv', filters = {}) {
    return http.get('/admin/categories/export', {
      params: { format, ...filters },
      responseType: 'blob'
    });
  }

  exportOrders(format = 'csv', filters = {}) {
    return http.get('/admin/orders/export', {
      params: { format, ...filters },
      responseType: 'blob'
    });
  }

  exportUsers(format = 'csv', filters = {}) {
    return http.get('/admin/users/export', {
      params: { format, ...filters },
      responseType: 'blob'
    });
  }

  // Методы для аналитики
  getSalesAnalytics(period = 'month', filters = {}) {
    return http.get('/admin/analytics/sales', {
      params: { period, ...filters }
    });
  }

  getCategoryAnalytics(categoryId, period = 'month') {
    return http.get(`/admin/analytics/categories/${categoryId}`, {
      params: { period }
    });
  }

  // Методы для уведомлений
  sendNotificationToUsers(notificationData) {
    return http.post('/admin/notifications/send', notificationData);
  }

  getNotificationHistory(params = {}) {
    return http.get('/admin/notifications/history', { params });
  }

  // Методы для настроек
  getAdminSettings() {
    return http.get('/admin/settings');
  }

  updateAdminSettings(settingsData) {
    return http.put('/admin/settings', settingsData);
  }

  // Методы для резервного копирования
  createBackup() {
    return http.post('/admin/backup/create');
  }

  getBackupHistory() {
    return http.get('/admin/backup/history');
  }

  restoreBackup(backupId) {
    return http.post(`/admin/backup/restore/${backupId}`);
  }

  downloadBackup(backupId) {
    return http.get(`/admin/backup/download/${backupId}`, {
      responseType: 'blob'
    });
  }
}

const adminService = new AdminService();
export default adminService; 