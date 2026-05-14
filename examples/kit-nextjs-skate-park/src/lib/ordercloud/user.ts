import { Me } from './index';

/**
 * Service for managing User Profile and Addresses.
 * Uses the "Me" endpoints which automatically target the authenticated user.
 */
export const userService = {
  /**
   * Get the profile information of the currently logged-in user.
   */
  getUser: async (accessToken?: string) => {
    try {
      return await Me.Get({ accessToken });
    } catch (error) {
      console.error('[OrderCloud] GetUser Error:', error);
      throw error;
    }
  },

  /**
   * List all addresses for the current user.
   */
  getAddresses: async (accessToken?: string) => {
    try {
      const response = await Me.ListAddresses(undefined, { accessToken });
      return response.Items;
    } catch (error) {
      console.error('[OrderCloud] GetAddresses Error:', error);
      throw error;
    }
  },

  /**
   * Create a new address for the current user.
   */
  saveAddress: async (addressData: any, accessToken?: string) => {
    try {
      return await Me.CreateAddress(addressData, { accessToken });
    } catch (error) {
      console.error('[OrderCloud] SaveAddress Error:', error);
      throw error;
    }
  }
};
