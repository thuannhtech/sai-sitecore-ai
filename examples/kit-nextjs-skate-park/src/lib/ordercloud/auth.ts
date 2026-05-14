import { Me, Users, BUYER_SCROPES, Auth, Tokens, buildUserName } from './index';
import { config } from 'src/lib/config';
import { isUserToken } from './token-utils';
import { userService } from './user';
import { RegisterUserRequest } from './types';

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

      const clientID = config.ordercloud.adminClientId!;
      const clientSecret = config.ordercloud.adminClientSecret!;
      const storeUserName = buildUserName(username);
      const accessToken = await Auth.ElevatedLogin(
        clientSecret,
        storeUserName,
        password,
        clientID,
        BUYER_SCROPES
      );

      Tokens.SetAccessToken(accessToken.access_token);

      return accessToken;
    } catch (error) {
      console.error('[OrderCloud] Login Error:', error);
      throw error;
    }
  },

  /**
   * Register a new Buyer User.
   * Server-side: Uses Client Credentials and Users.Create for maximum reliability.
   */
  register: async (userData: RegisterUserRequest) => {
    try {
      // 1. Get an elevated token using Client Secret
      const authResponse = await Auth.ClientCredentials(
        config.ordercloud.adminClientSecret!,
        config.ordercloud.adminClientId!,
        ['FullAccess']
      );

      const storeUserName = buildUserName(userData.Username);

      // 2. Create the user directly in the specified Buyer Organization
      const response = await Users.Create(
        config.ordercloud.buyerId!,
        {
          ...userData,
          Username: storeUserName,
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

  /**
   * Get an anonymous token using Client Credentials with the anonymous client ID.
   * This allows unauthenticated users to browse and add items to cart.
   */
  getAnonymousToken: async () => {
    try {
      if (!config.ordercloud.anonClientId || !config.ordercloud.anonClientSecret) {
        throw new Error('Anonymous client credentials not configured');
      }

      const authResponse = await Auth.ClientCredentials(
        config.ordercloud.anonClientSecret,
        config.ordercloud.anonClientId,
        [
        "BuyerAdmin",
        "BuyerReader",
        "BuyerUserAdmin",
        "BuyerUserReader",
        "BuyerImpersonation",
        "Shopper",
        "AddressAdmin",
        "MeAddressAdmin",
        "MeAdmin",
        "MeCreditCardAdmin",
        "MeXpAdmin",
        "PasswordReset",
        "ShipmentAdmin",
        "ShipmentReader",
        "OrderAdmin",
        "OrderReader",
        "UnsubmittedOrderReader",
        "OverrideUnitPrice",
        "OverrideShipping",
        "CreditCardAdmin",
        "CreditCardReader",
        "ProductAdmin",
        "ProductReader",
        "PromotionReader",
        "PromotionAdmin"
      ]
      );

      Tokens.SetAccessToken(authResponse.access_token);

      return authResponse.access_token;
    } catch (error) {
      console.error('[OrderCloud] Anonymous Token Error:', error);
      throw error;
    }
  },
};
