import http from './http-common';

class UserService {
    // Получить профиль пользователя
    getProfile() { 
        return http.get('/profile'); 
    }
    
    // Получить заказы пользователя
    getOrders() { 
        return http.get('/user/orders'); 
    }
    
    // Выйти из системы
    logout() { 
        return http.get('/user/logout'); 
    }
}

const userService = new UserService();
export default userService;
