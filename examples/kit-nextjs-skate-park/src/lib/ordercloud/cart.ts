import { authService } from './auth';
import { Cart, LineItem, Order } from './index';
import { tokenHelper } from './token-helper';

export interface AddCartLineItemInput {
  ProductID: string;
  Quantity: number;
  ImageUrl?: string;
}

export interface UpdateCartLineItemQuantityInput {
  LineItemID: string;
  Quantity: number;
}

/**
 * Service for managing the current shopper cart through OrderCloud's Cart endpoints.
 * This service is designed to be used on the server (API routes, Server Actions).
 */
export const cartService = {
  ensureCart: async (accessToken: string) => {
    const cart = await Cart.Get({ accessToken });

    if (cart.ID) {
      return cart;
    }

    return await Cart.Save({} as Order, { accessToken });
  },

  /**
   * Get the current active cart for the authenticated shopper.
   */
  getCart: async (accessToken: string) => {
    try {
      try {
        return await Cart.Get({ accessToken });
      } catch (e: any) {
        if (e.response?.status === 404 || e.status === 404) {
          return null;
        }
        throw e;
      }
    } catch (error) {
      console.error('[OrderCloud] GetCart Error:', error);
      throw error;
    }
  },

  /**
   * Get all line items from the current active cart.
   */
  getLineItems: async (accessToken: string) => {
    try {
      try {
        const response = await Cart.ListLineItems(undefined, { accessToken });
        return response.Items || [];
      } catch (e: any) {
        if (e.response?.status === 404 || e.status === 404) {
          return [];
        }
        throw e;
      }
    } catch (error) {
      console.error('[OrderCloud] GetCartLineItems Error:', error);
      throw error;
    }
  },

  /**
   * Add a new line item to the current active cart.
   */
  addLineItem: async (item: AddCartLineItemInput, providedAccessToken?: string) => {
    try {
      // Check for existing token, create anonymous if missing
      let accessToken = providedAccessToken || await tokenHelper.getAccessTokenFromCookies();

      if (!accessToken) {
        console.log('[OrderCloud] No token found, getting anonymous token...');
        accessToken = await authService.getAnonymousToken();
        // Save token to cookie for future requests
        await tokenHelper.setAccessTokenInCookies(accessToken);
      }

      const cart = await cartService.ensureCart(accessToken);

      console.log('[OrderCloud] Adding line item to cart', {
        cartId: cart.ID,
        productId: item.ProductID,
        quantity: item.Quantity,
      });

      const existingItems = await Cart.ListLineItems(undefined, { accessToken });
      const existingItem = existingItems.Items?.find(
        existing => existing.ProductID === item.ProductID
      );

      if (existingItem) {
        const currentQuantity = existingItem.Quantity ?? 0;
        const lineItemId = existingItem.ID;

        if (!lineItemId) {
          throw new Error('Existing line item is missing its ID');
        }

        return await Cart.PatchLineItem(
          lineItemId,
          { Quantity: currentQuantity + item.Quantity },
          { accessToken }
        );
      }

      const lineItem: LineItem = {
        ProductID: item.ProductID,
        Quantity: item.Quantity,
        xp: {
          ImageUrl: item.ImageUrl
        }
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
  updateLineItemQuantity: async (item: UpdateCartLineItemQuantityInput, accessToken: string) => {
    try {
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
  removeLineItem: async (lineItemID: string, accessToken: string) => {
    try {
      await Cart.DeleteLineItem(lineItemID, { accessToken });
    } catch (error) {
      console.error(`[OrderCloud] RemoveCartLineItem Error for LineItem ${lineItemID}:`, error);
      throw error;
    }
  },
};
