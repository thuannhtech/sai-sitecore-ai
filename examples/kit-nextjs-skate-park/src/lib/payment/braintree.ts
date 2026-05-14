import braintree from 'braintree';

export interface BraintreeConfig {
  merchantId: string;
  publicKey: string;
  privateKey: string;
  environment: string; // 'Sandbox' or 'Production'
}

/**
 * Braintree Server-Side Service
 */
export const braintreeService = {
  getGateway: (config: BraintreeConfig) => {
    return new braintree.BraintreeGateway({
      environment: config.environment === 'Production' ? braintree.Environment.Production : braintree.Environment.Sandbox,
      merchantId: config.merchantId,
      publicKey: config.publicKey,
      privateKey: config.privateKey,
    });
  },

  /**
   * Create a transaction sale
   */
  createTransaction: async (amount: number, nonce: string, config: BraintreeConfig) => {
    try {
      const gateway = braintreeService.getGateway(config);
      
      const result = await gateway.transaction.sale({
        amount: amount.toString(),
        paymentMethodNonce: nonce,
        options: {
          submitForSettlement: true,
        },
      });

      if (result.success) {
        return {
          success: true,
          transactionId: result.transaction.id,
        };
      } else {
        return {
          success: false,
          message: result.message,
        };
      }
    } catch (error: any) {
      console.error('[Braintree Service] Sale Error:', error);
      return {
        success: false,
        message: error.message || 'Internal Braintree error',
      };
    }
  }
};
