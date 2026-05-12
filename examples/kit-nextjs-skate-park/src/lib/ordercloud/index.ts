import { Configuration, ApiRole } from 'ordercloud-javascript-sdk';
import { config } from 'src/lib/config';

export const BUYER_SCROPES: ApiRole[] = [
  "BuyerAdmin",
  "BuyerReader",
  "BuyerUserAdmin",
  "BuyerUserReader",
  "BuyerImpersonation",
  "Shopper",
  "AddressAdmin",
  "MeAddressAdmin",
  "MeAdmin",
  "MeCreditCardAdmin",
  "MeXpAdmin",
  "PasswordReset",
  "ShipmentAdmin",
  "ShipmentReader",
  "OrderAdmin",
  "OrderReader",
  "UnsubmittedOrderReader",
  "OverrideUnitPrice",
  "OverrideShipping",
  "CreditCardAdmin",
  "CreditCardReader",
  "ProductAdmin",
  "ProductReader",
  "PromotionReader",
  "PromotionAdmin",
];

/**
 * Initializes the OrderCloud SDK with environment configuration.
 * Note: clientSecret should only be used on the server.
 */
Configuration.Set({
  baseApiUrl: config.ordercloud.baseApiUrl,
  timeoutInMilliseconds: 20 * 1000,
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  }
});

export const buildUserName = (username: string) => {
  return `${config.ordercloud.buyerId}_${username}`;
}

export * from 'ordercloud-javascript-sdk';
