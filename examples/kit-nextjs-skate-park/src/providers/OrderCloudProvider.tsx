'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Auth, Tokens, ApiRole } from '@/lib/ordercloud';

interface OrderCloudContextType {
  isAuthenticated: boolean;
  isAnonymous: boolean;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const OrderCloudContext = createContext<OrderCloudContextType | undefined>(undefined);

export const OrderCloudProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);


  useEffect(() => {
    const initAuth = async () => {
      let currentToken = Tokens.GetAccessToken();

      if (!currentToken) {
        try {
          const scope = (process.env.NEXT_PUBLIC_ORDERCLOUD_SCOPE?.split(',') as ApiRole[]) || ['FullAccess' as ApiRole];
          const authResponse = await Auth.Anonymous(
            process.env.NEXT_PUBLIC_ORDERCLOUD_CLIENT_ID!,
            scope
          );
          currentToken = authResponse.access_token;
        } catch (error: any) {
          console.error('OrderCloud Auth Failed:', error.response?.data || error);
        }
      }

      setToken(currentToken || null);
    };

    initAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const scope = (process.env.NEXT_PUBLIC_ORDERCLOUD_SCOPE?.split(',') as ApiRole[]) || ['FullAccess' as ApiRole];
      const auth = await Auth.Login(username, password, process.env.NEXT_PUBLIC_ORDERCLOUD_CLIENT_ID!, scope);
      setToken(auth.access_token);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    Tokens.RemoveAccessToken();
    setToken(null);
    // Optionally trigger a refresh or redirect
    window.location.reload();
  };

  return (
    <OrderCloudContext.Provider
      value={{
        isAuthenticated: !!token,
        isAnonymous: !token, // Adjust as needed
        token,
        login,
        logout
      }}
    >
      {children}
    </OrderCloudContext.Provider>
  );
};

export const useOrderCloud = () => {
  const context = useContext(OrderCloudContext);
  if (context === undefined) {
    throw new Error('useOrderCloud must be used within an OrderCloudProvider');
  }
  return context;
};
