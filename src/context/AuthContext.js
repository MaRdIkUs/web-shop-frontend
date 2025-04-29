import React, { createContext, useState, useEffect } from 'react';
import { useKeycloak } from '@react-keycloak/web';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const { keycloak, initialized } = useKeycloak();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // После инициализации Keycloak устанавливаем информацию о пользователе
    if (initialized && keycloak.authenticated) {
      setUser({
        username: keycloak.tokenParsed.preferred_username,
        roles: keycloak.tokenParsed.realm_access.roles
      });
    }
  }, [initialized, keycloak]);

  return (
    <AuthContext.Provider value={{ keycloak, user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
