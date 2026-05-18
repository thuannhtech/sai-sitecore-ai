import { Address, BuyerAddress, Cart, Me, Orders } from './index';
import { cartService } from './cart';
import { userService } from './user';

export interface OrderAddressInput {
  firstName: string;
  lastName: string;
  phone?: string;
  addressLine1: string;
  addressLine2?: string;
  email?: string;
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
  City: 'N/A',
  State: 'N/A',
  Zip: 'N/A',
  Country: 'SC',
  CompanyName: address.companyName,
});

const mapBuyerAddressInput = (
  address: OrderAddressInput,
  type: 'shipping' | 'billing'
): BuyerAddress => ({
  FirstName: address.firstName,
  LastName: address.lastName,
  Phone: address.phone,
  Street1: address.addressLine1,
  City: 'N/A',
  State: 'N/A',
  Zip: 'N/A',
  Country: 'SC',
  CompanyName: address.companyName,
  Shipping: type === 'shipping',
  Billing: type === 'billing',
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

  getMyOrder: async (orderId: string) => {
    try {
      const accessToken = await cartService.getAccessTokenFromCookies();
      if (!accessToken) {
        throw new Error('Missing OrderCloud access token');
      }

      const [order, currentUser] = await Promise.all([
        Orders.Get('Outgoing', orderId, { accessToken }),
        userService.getUser(accessToken),
      ]);

      if (!order) {
        throw new Error('Order not found');
      }

      const currentUserId = currentUser?.ID;
      const orderUserId = order.FromUserID || order.FromUser?.ID;

      if (!currentUserId || !orderUserId || currentUserId !== orderUserId) {
        throw new Error('Order does not belong to the current user');
      }

      return order;
    } catch (error) {
      console.error('[OrderCloud] GetMyOrder Error:', error);
      throw error;
    }
  },

  listOrders: async () => {
    try {
      const accessToken = await cartService.getAccessTokenFromCookies();
      if (!accessToken) {
        throw new Error('Missing OrderCloud access token');
      }

      return await Orders.List(
        'Outgoing',
        {
          page: 1,
          pageSize: 50,
          sortBy: ['DateSubmitted'],
        },
        { accessToken }
      );
    } catch (error) {
      console.error('[OrderCloud] ListOrders Error:', error);
      throw error;
    }
  },

  listMyOrders: async () => {
    try {
      const accessToken = await cartService.getAccessTokenFromCookies();
      if (!accessToken) {
        throw new Error('Missing OrderCloud access token');
      }

      return await Me.ListOrders(
        {
          page: 1,
          pageSize: 50,
          sortBy: ['!DateSubmitted'],
          filters: {
            IsSubmitted: true,
          },
        },
        { accessToken }
      );
    } catch (error) {
      console.error('[OrderCloud] ListMyOrders Error:', error);
      throw error;
    }
  },

  assignSavedAddress: async (type: 'shipping' | 'billing', address: OrderAddressInput, isGuest: boolean) => {
    const accessToken = await cartService.getAccessTokenFromCookies();

    if (!accessToken) {
      throw new Error('Missing OrderCloud access token');
    }

    const cart = await cartService.getCart();
    if (!cart?.ID) {
      throw new Error('No active cart found');
    }

    const savedAddress = await userService.saveAddress(
      mapBuyerAddressInput(address, type),
      accessToken
    );
    
    const addressID = savedAddress.ID;

    if (!addressID) {
      throw new Error('Address ID was not returned');
    }

    return await cartService.patchCart({
      ID: cart.ID,
      ...(type === 'shipping'
        ? { ShippingAddressID: addressID }
        : { BillingAddressID: addressID }),
    });
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
      if (!cart) {
        throw new Error('Cart not found');
      }

      if(cart == null){
        throw new Error('No active cart found');
      }

      const isGuest = cart.FromUser?.Username === 'SitecoreAIBuyerAnonymousUser';

      if (isGuest && cart.ID) {
        const existingXp = cart.xp ?? {};

        return await cartService.patchCart({
          ID: cart.ID,
          xp: {
            ...existingXp,
            Email: address.email,
            ShippingAddress: mapAddressInput(address)
          },
        });
      }

      return await orderService.assignSavedAddress('shipping', address, isGuest);

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

      const cart = await cartService.getCart();
      if (!cart) {
        throw new Error('Cart not found');
      }

      const isGuest = cart.FromUser?.Username === 'SitecoreAIBuyerAnonymousUser';
      if (isGuest) {
        return await Cart.SetBillingAddress(mapAddressInput(address), { accessToken });
      }

      return await orderService.assignSavedAddress('billing', address, isGuest);
    } catch (error) {
      console.error('[OrderCloud] SetBillingAddress Error:', error);
      throw error;
    }
  },
};
