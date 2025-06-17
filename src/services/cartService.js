import http from './http-common';

class CartService {
  // Получить корзину
  getCart() {
    return http.get('/cart/');
  }

  // Добавить в корзину
  addToCart(productId, quantity) {
    return http.post('/cart/', { productId, quantity });
  }

  // Изменить количество предметов в корзине
  updateCartItem(itemId, quantity) {
    return http.put('/cart/', { itemId, quantity });
  }

  // Удалить из корзины
  removeFromCart(itemId) {
    return http.delete('/cart/', { params: { itemId } });
  }
}

const cartService = new CartService();
export default cartService; 