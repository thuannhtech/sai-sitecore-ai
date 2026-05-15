import { config } from 'next/dist/build/templates/pages';
import { Addresses, BuyerAddress, Me } from './index';

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
  saveAddress: async (addressData: BuyerAddress, accessToken?: string) => {
    try {
      return await Me.CreateAddress(addressData, { accessToken });
    } catch (error) {
      console.error('[OrderCloud] SaveAddress Error:', error);
      throw error;
    }
  },
  assignAddress: async (addressId: string, userID: string, type: 'shipping' | 'billing', accessToken?: string) => {
    try {
      return await Addresses.SaveAssignment(config.ordercloud.buyerId, 
        {
          AddressID: addressId,
          UserID: userID,
          IsBilling: type === 'billing',
          IsShipping: type === 'shipping',
        },
        { accessToken });
    } catch (error) {
      console.error('[OrderCloud] AssignAddress Error:', error);
      throw error;
    } 
  }
};
