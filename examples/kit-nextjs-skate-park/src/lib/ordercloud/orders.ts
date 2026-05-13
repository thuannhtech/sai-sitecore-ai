import { Address, Cart, Orders } from './index';
import { cartService } from './cart';

export interface OrderAddressInput {
  firstName: string;
  lastName: string;
  phone?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  zipCode?: string;
  country: string;
  companyName?: string;
}

const withFallback = (value?: string) => {
  const normalized = value?.trim();
  return normalized ? normalized : 'N/A';
};

const mapAddressInput = (address: OrderAddressInput): Address => ({
  FirstName: address.firstName,
  LastName: address.lastName,
  Phone: address.phone,
  Street1: address.addressLine1,
  City: withFallback(address.city),
  State: withFallback(address.state),
  Zip: withFallback(address.zipCode),
  Country: 'SC',
  CompanyName: withFallback(address.companyName),
});

/**
 * Service for managing the active cart-order during checkout.
 */
export const orderService = {
  /**
   * Create or return the current active order from the shopper cart.
   */
  createOrder: async () => {
    try {
      const accessToken = await cartService.getAccessTokenFromCookies();

      if (!accessToken) {
        throw new Error('Missing OrderCloud access token');
      }

      return await cartService.ensureCart(accessToken);
    } catch (error) {
      console.error('[OrderCloud] CreateOrder Error:', error);
      throw error;
    }
  },

  /**
   * Get an order by ID or the current active cart order.
   */
  getOrder: async (orderId?: string) => {
    try {
      const accessToken = await cartService.getAccessTokenFromCookies();
      if (!accessToken) {
        throw new Error('Missing OrderCloud access token');
      }

      if (orderId) {
        return await Orders.Get('Outgoing', orderId, { accessToken });
      }

      return await cartService.getCart();
    } catch (error) {
      console.error('[OrderCloud] GetOrder Error:', error);
      throw error;
    }
  },

  /**
   * Set the shipping address on the current active order.
   */
  setShippingAddress: async (address: OrderAddressInput) => {
    try {
      const accessToken = await cartService.getAccessTokenFromCookies();

      if (!accessToken) {
        throw new Error('Missing OrderCloud access token');
      }

      const cart = await cartService.getCart();

      const isGuest = cart.FromUser?.Username === 'SitecoreAIBuyerAnonymousUser';

      if (isGuest && cart.ID) {
        const existingXp = cart.xp ?? {};

        return await cartService.patchCart({
          ID: cart.ID,
          xp: {
            ...existingXp,
            shippingAddress: mapAddressInput(address)
          },
        });
      }

      return await Cart.SetShippingAddress(mapAddressInput(address), { accessToken });

    } catch (error) {
      console.error('[OrderCloud] SetShippingAddress Error:', error);
      throw error;
    }
  },

  /**
   * Set the billing address on the current active order.
   */
  setBillingAddress: async (address: OrderAddressInput) => {
    try {
      const accessToken = await cartService.getAccessTokenFromCookies();
      if (!accessToken) {
        throw new Error('Missing OrderCloud access token');
      }

      return await Cart.SetBillingAddress(mapAddressInput(address), { accessToken });
    } catch (error) {
      console.error('[OrderCloud] SetBillingAddress Error:', error);
      throw error;
    }
  },
};
