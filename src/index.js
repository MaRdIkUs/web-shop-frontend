import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

import { ReactKeycloakProvider } from '@react-keycloak/web';
import keycloak from './services/keycloak';

import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { BrowserRouter } from 'react-router-dom';

// Настройка корневого рендера с провайдерами Keycloak, контекстов и маршрутизации
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ReactKeycloakProvider authClient={keycloak}>
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  </ReactKeycloakProvider>
);