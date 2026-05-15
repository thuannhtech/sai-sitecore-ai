import crypto from 'crypto';
import { config } from 'src/lib/config';

const ACTIVATION_TOKEN_TTL_SECONDS = 15 * 60;

type ActivationTokenPayload = {
  uid: string;
  email: string;
  exp: number;
  iat: number;
};

const encodeBase64Url = (value: string) => Buffer.from(value, 'utf8').toString('base64url');

const decodeBase64Url = (value: string) => Buffer.from(value, 'base64url').toString('utf8');

const getSecret = () => {
  const secret = config.ordercloud.adminClientSecret;

  if (!secret) {
    throw new Error('Missing activation token secret');
  }

  return secret;
};

const signPayload = (payload: string) =>
  crypto.createHmac('sha256', getSecret()).update(payload).digest('base64url');

export const activationTokenService = {
  ttlSeconds: ACTIVATION_TOKEN_TTL_SECONDS,

  createToken: (input: { userId: string; email: string }) => {
    const now = Math.floor(Date.now() / 1000);
    const payload: ActivationTokenPayload = {
      uid: input.userId,
      email: input.email,
      iat: now,
      exp: now + ACTIVATION_TOKEN_TTL_SECONDS,
    };

    const encodedPayload = encodeBase64Url(JSON.stringify(payload));
    const signature = signPayload(encodedPayload);

    return `${encodedPayload}.${signature}`;
  },

  verifyToken: (token: string) => {
    if (!token) {
      throw new Error('Missing activation token');
    }

    const [encodedPayload, signature] = token.split('.');

    if (!encodedPayload || !signature) {
      throw new Error('Invalid activation token format');
    }

    const expectedSignature = signPayload(encodedPayload);
    const providedSignature = Buffer.from(signature, 'utf8');
    const actualSignature = Buffer.from(expectedSignature, 'utf8');

    if (
      providedSignature.length !== actualSignature.length ||
      !crypto.timingSafeEqual(providedSignature, actualSignature)
    ) {
      throw new Error('Invalid activation token signature');
    }

    const payload = JSON.parse(decodeBase64Url(encodedPayload)) as ActivationTokenPayload;
    const now = Math.floor(Date.now() / 1000);

    if (!payload.uid || !payload.email || !payload.exp || !payload.iat) {
      throw new Error('Invalid activation token payload');
    }

    if (payload.exp < now) {
      throw new Error('Activation token expired');
    }

    return payload;
  },
};
