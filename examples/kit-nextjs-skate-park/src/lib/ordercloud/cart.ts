import { cookies } from 'next/headers';
import { Cart, LineItem, Order } from './index';

export interface AddCartLineItemInput {
  ProductID: string;
  Quantity: number;
}

export interface UpdateCartLineItemQuantityInput {
  LineItemID: string;
  Quantity: number;
}

/**
 * Service for managing the current shopper cart through OrderCloud's Cart endpoints.
 */
export const cartService = {
  getAccessTokenFromCookies: async () => {
    const cookieStore = await cookies();
    return cookieStore.get('skate-park.access-token')?.value;
  },

  ensureCart: async (accessToken: string) => {
    const cart = await Cart.Get({ accessToken });

    console.log('Current cart:', cart); // Debug log
    if (cart.ID) {
      return cart;
    }

    return await Cart.Save({} as Order, { accessToken });
  },

  /**
   * Get the current active cart for the authenticated shopper.
   */
  getCart: async () => {
    try {
      const accessToken = await cartService.getAccessTokenFromCookies();

      if (!accessToken) {
        throw new Error('Missing OrderCloud access token');
      }

      return await Cart.Get({ accessToken });
    } catch (error) {
      console.error('[OrderCloud] GetCart Error:', error);
      throw error;
    }
  },

  /**
   * Get all line items from the current active cart.
   */
  getLineItems: async () => {
    try {
      const accessToken = await cartService.getAccessTokenFromCookies();

      if (!accessToken) {
        throw new Error('Missing OrderCloud access token');
      }

      const response = await Cart.ListLineItems(undefined, { accessToken });
      return response.Items;
    } catch (error) {
      console.error('[OrderCloud] GetCartLineItems Error:', error);
      throw error;
    }
  },

  /**
   * Add a new line item to the current active cart.
   */
  addLineItem: async (item: AddCartLineItemInput) => {
    try {
      const accessToken = await cartService.getAccessTokenFromCookies();

      if (!accessToken) {
        throw new Error('Missing OrderCloud access token');
      }

      await cartService.ensureCart(accessToken);

      const lineItem: LineItem = {
        ProductID: item.ProductID,
        Quantity: item.Quantity,
      };

      return await Cart.CreateLineItem(lineItem, { accessToken });
    } catch (error) {
      console.error(`[OrderCloud] AddCartLineItem Error for Product ${item.ProductID}:`, error);
      throw error;
    }
  },

  /**
   * Update the quantity of an existing line item in the current active cart.
   */
  updateLineItemQuantity: async (item: UpdateCartLineItemQuantityInput) => {
    try {
      const accessToken = await cartService.getAccessTokenFromCookies();

      if (!accessToken) {
        throw new Error('Missing OrderCloud access token');
      }

      return await Cart.PatchLineItem(
        item.LineItemID,
        {
          Quantity: item.Quantity,
        },
        { accessToken }
      );
    } catch (error) {
      console.error(
        `[OrderCloud] UpdateCartLineItemQuantity Error for LineItem ${item.LineItemID}:`,
        error
      );
      throw error;
    }
  },

  /**
   * Remove a line item from the current active cart.
   */
  removeLineItem: async (lineItemID: string) => {
    try {
      const accessToken = await cartService.getAccessTokenFromCookies();

      if (!accessToken) {
        throw new Error('Missing OrderCloud access token');
      }

      await Cart.DeleteLineItem(lineItemID, { accessToken });
    } catch (error) {
      console.error(`[OrderCloud] RemoveCartLineItem Error for LineItem ${lineItemID}:`, error);
      throw error;
    }
  },
};
