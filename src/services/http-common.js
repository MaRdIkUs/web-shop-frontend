import axios from 'axios';

// Determine the correct API URL based on the current environment
export const getApiUrl = () => {
  // If we have an environment variable, use it
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // For development, use the same protocol and host as the frontend
  const currentOrigin = window.location.origin;
  const isLocalhost = currentOrigin.includes('localhost') || currentOrigin.includes('127.0.0.1');
  
  if (isLocalhost) {
    return 'http://localhost:5000/api';
  }
  
  // For production-like environments, use the same protocol as frontend
  const protocol = window.location.protocol;
  const host = window.location.hostname;
  return `${protocol}//${host}:5000/api`;
};

const axiosInstance = axios.create({
  baseURL: getApiUrl(),
  withCredentials: process.env.REACT_APP_ENV === 'dev' ? true : false,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    ...(process.env.REACT_APP_ENV === 'dev' && {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    })
  }
});

axiosInstance.interceptors.request.use(
  function (config) {
    if (process.env.REACT_APP_ENV === 'dev') {
      config.withCredentials = true;
      
      if (config.method === 'options' || config.method === 'OPTIONS') {
        config.headers['Access-Control-Request-Method'] = 'GET,PUT,POST,DELETE,PATCH,OPTIONS';
        config.headers['Access-Control-Request-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept, Authorization';
      }
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  function (response) {
    if (response.status === 302 && response.headers.location) {
      if (!response.config.url.includes('/user/login')) {
        window.location.href = response.headers.location;
      }
    }
    return response;
  },
  function (error) {
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.warn('Network error detected. Server might be unavailable or CORS is blocking the request.');
      console.warn('Current API URL:', getApiUrl());
      console.warn('Current origin:', window.location.origin);
      
      if (process.env.REACT_APP_ENV === 'dev') {
        console.warn('Development mode: Check if your backend server is running and CORS is properly configured.');
        console.warn('You can set REACT_APP_ENV=dev in your .env file to enable CORS bypass.');
        console.warn('Make sure your backend server is running on the same protocol (http/https) as your frontend.');
      }
    }
    
    if (process.env.REACT_APP_ENV === 'dev' && error.message.includes('CORS')) {
      console.warn('CORS error detected in development mode:', error.message);
      console.warn('Make sure your backend allows requests from:', window.location.origin);
      console.warn('Backend should be configured to allow credentials and handle preflight requests.');
    }
    
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      console.warn('Request timeout. Server might be slow or unavailable.');
    }
    
    if (error.response?.status === 302 && error.response.headers.location) {
      if (!error.config.url.includes('/user/login')) {
        window.location.href = error.response.headers.location;
      }
    }
    
    if (error.response?.status === 401) {
      console.warn('Unauthorized access detected');
    }
    
    if (error.response?.status >= 500) {
      console.error('Server error:', error.response?.data);
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;