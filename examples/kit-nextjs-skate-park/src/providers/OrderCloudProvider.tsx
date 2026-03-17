'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Auth, Tokens, ApiRole, Me } from '@/lib/ordercloud';

interface OrderCloudContextType {
  isAuthenticated: boolean;
  isAnonymous: boolean;
  token: string | null;
  user: any | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const OrderCloudContext = createContext<OrderCloudContextType | undefined>(undefined);

export const OrderCloudProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const initAuth = async () => {
      let currentToken = Tokens.GetAccessToken();
      
      try {
        if (!currentToken) {
          const scope = (process.env.NEXT_PUBLIC_ORDERCLOUD_SCOPE?.split(',') as ApiRole[]) || ['FullAccess' as ApiRole];
          const authResponse = await Auth.Anonymous(
            process.env.NEXT_PUBLIC_ORDERCLOUD_CLIENT_ID!,
            scope
          );
          currentToken = authResponse.access_token;
          Tokens.SetAccessToken(currentToken);
        }

        if (currentToken) {
          try {
            // Force passing token explicitly for iframe support
            const me = await Me.Get({ accessToken: currentToken });
            setUser(me);
            setToken(currentToken);
          } catch (e: any) {
            console.warn("Me.Get() initial attempt failed:", e.response?.status);

            if (e.response?.status === 401) {
              Tokens.RemoveAccessToken();
              const scope = (process.env.NEXT_PUBLIC_ORDERCLOUD_SCOPE?.split(',') as ApiRole[]) || ['FullAccess' as ApiRole];
              const authResponse = await Auth.Anonymous(
                process.env.NEXT_PUBLIC_ORDERCLOUD_CLIENT_ID!,
                scope
              );
              currentToken = authResponse.access_token;
              Tokens.SetAccessToken(currentToken);

              // Retry once with explicit token
              const me = await Me.Get({ accessToken: currentToken });
              setUser(me);
              setToken(currentToken);
            } else {
              throw e;
            }
          }
        }
      } catch (error: any) {
        console.error('OrderCloud Auth Error:', error.response?.data || error);
        // Fallback for Sitecore Editor: don't block the UI if OC fails
        setUser({ Username: null, Anonymous: true }); 
        setToken(currentToken || null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const scope = (process.env.NEXT_PUBLIC_ORDERCLOUD_SCOPE?.split(',') as ApiRole[]) || ['FullAccess' as ApiRole];
      const auth = await Auth.Login(username, password, process.env.NEXT_PUBLIC_ORDERCLOUD_CLIENT_ID!, scope);
      setToken(auth.access_token);
      const me = await Me.Get();
      setUser(me);
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
        isAuthenticated: !!user && !!user.Username,
        isAnonymous: !user || !user.Username,
        token,
        user,
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
