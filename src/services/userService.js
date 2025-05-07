import http from './http-common';

class UserService {
    getProfile() { return http.get('/user/profile'); }
    getOrders(id) { return http.get(`/user/orders`); }
    login(id) { return http.get(`/user/login`); }
    logout(id) { return http.get(`/user/logout`) }
}

const userService = new UserService();
export default userService;
