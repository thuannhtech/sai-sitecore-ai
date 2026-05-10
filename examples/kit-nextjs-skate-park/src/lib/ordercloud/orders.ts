import { Me } from './index';

/**
 * Service for managing the Checkout and Ordering process.
 */
export const orderService = {
  /**
   * Create an initial order for the current user.
   */
  createOrder: async (orderData: any = {}) => {
    try {
      return await Me.CreateOrder(orderData);
    } catch (error) {
      console.error('[OrderCloud] CreateOrder Error:', error);
      throw error;
    }
  },

  /**
   * Add a product to an existing order (Line Item).
   */
  addItem: async (orderId: string, item: { ProductID: string; Quantity: number }) => {
    try {
      return await Me.CreateLineItem(orderId, item);
    } catch (error) {
      console.error(`[OrderCloud] AddItem Error for Order ${orderId}:`, error);
      throw error;
    }
  },

  /**
   * Submit the order to finalize the transaction.
   */
  submitOrder: async (orderId: string) => {
    try {
      return await Me.SubmitOrder(orderId);
    } catch (error) {
      console.error(`[OrderCloud] SubmitOrder Error for ID ${orderId}:`, error);
      throw error;
    }
  },

  /**
   * Get current order details.
   */
  getOrder: async (orderId: string) => {
    try {
      return await Me.GetOrder(orderId);
    } catch (error) {
      console.error(`[OrderCloud] GetOrder Error for ID ${orderId}:`, error);
      throw error;
    }
  }
};
