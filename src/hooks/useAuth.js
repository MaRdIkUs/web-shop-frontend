import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

// Хук для доступа к AuthContext
export const useAuth = () => useContext(AuthContext);