import http from './http-common';

class UserService {
    getProfile() { return http.get('/user/profile'); }
    getOrders(id) { return http.get(`/user/orders`); }
}

const userService = new UserService();
export default userService;
