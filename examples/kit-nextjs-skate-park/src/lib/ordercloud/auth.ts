import { Auth, Me, Tokens, Users } from './index';
import { config } from 'src/lib/config';

/**
 * Service for handling User Authentication with OrderCloud.
 */
export const authService = {
  /**
   * Log in a user using Username/Password (OAuth2 Password Grant).
   * The SDK automatically manages the access token in cookies/local storage.
   */
  login: async (username: string, password: string) => {
    try {
      const authResponse = await Auth.Login(
        username, 
        password, 
        config.ordercloud.clientId!, 
        ['FullAccess', 'MeAddressAdmin', 'MeCreditCardAdmin']
      );
      return authResponse;
    } catch (error) {
      console.error('[OrderCloud] Login Error:', error);
      throw error;
    }
  },
  
  /**
   * Register a new Buyer User.
   * Server-side: Uses Client Credentials and Users.Create for maximum reliability.
   */
  register: async (userData: any) => {
    try {
      // 1. Get an elevated token using Client Secret
      const authResponse = await Auth.ClientCredentials(
        config.ordercloud.clientSecret!, 
        config.ordercloud.clientId!, 
        ['BuyerUserAdmin']
      );

      // 2. Create the user directly in the specified Buyer Organization
      const response = await Users.Create(
        config.ordercloud.buyerId!, 
        {
          ...userData,
          Active: true,
        }, 
        { accessToken: authResponse.access_token }
      );

      return response;
    } catch (error: any) {
      console.error('[OrderCloud] Registration Error:', error.response?.data || error.message);
      throw error;
    }
  },

  logout: () => {
    Tokens.RemoveAccessToken();
    Tokens.RemoveRefreshToken();
  },

  getToken: () => Tokens.GetAccessToken(),
  
  isAuthenticated: () => !!Tokens.GetAccessToken(),
};
