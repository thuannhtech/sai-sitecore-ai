import { Me } from './index';

/**
 * Service for Catalog operations.
 */
export const productService = {
  /**
   * Get product details by OrderCloudProductId.
   * Uses Me.GetProduct to ensure the product is available to the current user/buyer context.
   */
  getProduct: async (productId: string) => {
    try {
      return await Me.GetProduct(productId);
    } catch (error) {
      console.error(`[OrderCloud] GetProduct Error for ID ${productId}:`, error);
      throw error;
    }
  }
};
