import { Me } from './index';

/**
 * Service for managing User Profile and Addresses.
 * Uses the "Me" endpoints which automatically target the authenticated user.
 */
export const userService = {
  /**
   * Get the profile information of the currently logged-in user.
   */
  getUser: async () => {
    try {
      return await Me.Get();
    } catch (error) {
      console.error('[OrderCloud] GetUser Error:', error);
      throw error;
    }
  },

  /**
   * List all addresses for the current user.
   */
  getAddresses: async () => {
    try {
      const response = await Me.ListAddresses();
      return response.Items;
    } catch (error) {
      console.error('[OrderCloud] GetAddresses Error:', error);
      throw error;
    }
  },

  /**
   * Create a new address for the current user.
   */
  saveAddress: async (addressData: any) => {
    try {
      return await Me.CreateAddress(addressData);
    } catch (error) {
      console.error('[OrderCloud] SaveAddress Error:', error);
      throw error;
    }
  }
};
