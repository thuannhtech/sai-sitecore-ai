import { Configuration } from 'ordercloud-javascript-sdk';
import { config } from 'src/lib/config';

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

export * from 'ordercloud-javascript-sdk';
