import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User, AuthState } from '@/types';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    // Simula verificação de sessão
    const storedUser = localStorage.getItem('reserva_salas_user');
    if (storedUser) {
      setState({
        user: JSON.parse(storedUser),
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    // Simula delay de API
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Validação simples para demonstração
    if (email && password.length >= 6) {
      const user: User = {
        id: crypto.randomUUID(),
        name: email.split('@')[0],
        email,
      };
      
      localStorage.setItem('reserva_salas_user', JSON.stringify(user));
      setState({ user, isAuthenticated: true, isLoading: false });
      return true;
    }
    
    setState(prev => ({ ...prev, isLoading: false }));
    return false;
  }, []);

  const register = useCallback(async (name: string, email: string, password: string): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (name && email && password.length >= 6) {
      const user: User = {
        id: crypto.randomUUID(),
        name,
        email,
      };
      
      localStorage.setItem('reserva_salas_user', JSON.stringify(user));
      setState({ user, isAuthenticated: true, isLoading: false });
      return true;
    }
    
    setState(prev => ({ ...prev, isLoading: false }));
    return false;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('reserva_salas_user');
    setState({ user: null, isAuthenticated: false, isLoading: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
