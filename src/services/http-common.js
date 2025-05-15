import axios from 'axios';
import UserService from '../services/userService';


const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api'
});

axiosInstance.interceptors.response.use(
  function (response) {
    if(response.headers.location && response.status === 302){
      window.location.href = response.headers.location
    }
    return response;
  },
  function (error) {
    if (error.response?.status === 401) {
      // Редирект на /login
      UserService.logout()
      window.location.href = '/login';
    }
    if (error.response?.status >= 302) {
      // Редирект на /login
      UserService.logout()
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;