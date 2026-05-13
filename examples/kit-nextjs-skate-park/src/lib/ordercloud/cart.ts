import { cookies } from 'next/headers';
import type { Payment, PaymentTransaction } from './index';
import { Cart, LineItem, Order } from './index';
import { authService } from './auth';
import { log } from 'console';

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
    return cookieStore.get('oc-token')?.value;
  },

  setAccessTokenInCookies: async (token: string) => {
    const cookieStore = await cookies();
    cookieStore.set('oc-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 36000, // 1 hour
    });
  },

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
  patchCart: async (cart: Partial<Order>) => {
    try {
      const accessToken = await cartService.getAccessTokenFromCookies();

      if (!accessToken) {
        throw new Error('Missing OrderCloud access token');
      }

      return await Cart.Patch(cart, { accessToken });
    } catch (error) {
      console.error('[OrderCloud] PatchCart Error:', error);
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
      // Check for existing token, create anonymous if missing
      let accessToken = await cartService.getAccessTokenFromCookies();
      
      if (!accessToken) {
        console.log('[OrderCloud] No token found, getting anonymous token...');
        accessToken = await authService.getAnonymousToken();
        // Save token to cookie for future requests
        await cartService.setAccessTokenInCookies(accessToken);
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

  /**
   * Create a payment on the current active cart.
   */
  createPayment: async (payment: Payment, accessToken: string) => {
    try {
      await cartService.ensureCart(accessToken);
      return await Cart.CreatePayment(payment, { accessToken });
    } catch (error) {
      console.error('[OrderCloud] CreatePayment Error:', error);
      throw error;
    }
  },

  /**
   * Add a payment transaction to a cart payment.
   */
  createPaymentTransaction: async (paymentID: string, paymentTransaction: PaymentTransaction, accessToken: string) => {
    try {
      return await Cart.CreatePaymentTransaction(paymentID, paymentTransaction, { accessToken });
    } catch (error) {
      console.error('[OrderCloud] CreatePaymentTransaction Error:', error);
      throw error;
    }
  },
};
