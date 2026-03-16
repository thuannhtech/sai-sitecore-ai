import { Configuration } from 'ordercloud-javascript-sdk';

const clientId = process.env.NEXT_PUBLIC_ORDERCLOUD_CLIENT_ID || '';
const baseApiUrl = process.env.NEXT_PUBLIC_ORDERCLOUD_BASE_API_URL || 'https://sandboxapi.ordercloud.io';

Configuration.Set({
  baseApiUrl: baseApiUrl,
  clientID: clientId,
  cookieOptions: {
    prefix: 'tailstore',
    secure: process.env.NODE_ENV === 'production',
  },
});

export { Configuration };
export * from 'ordercloud-javascript-sdk';
