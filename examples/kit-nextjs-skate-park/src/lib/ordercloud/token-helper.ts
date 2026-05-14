import { cookies } from 'next/headers';
import { authService } from './auth';

export const tokenHelper = {
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
      maxAge: 36000, // 10 hours
    });
  },

  /**
   * Decodes a JWT token to extract its payload without verifying the signature.
   * Useful for checking claims like Client ID (cid).
   */
  decodeToken: (token: string) => {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));
    } catch (e) {
      return null;
    }
  },

  /**
   * Checks if the given token was issued to the anonymous client ID.
   */
  isAnonymousToken: (token: string) => {
    if (!token) return true;
    const decoded = tokenHelper.decodeToken(token);
    const anonClientId = process.env.NEXT_PUBLIC_ORDERCLOUD_CLIENT_ID_ANNO;
    return decoded?.cid === anonClientId;
  },

  /**
   * Checks if the user profile belongs to a guest user based on naming conventions.
   */
  isGuestProfile: (user: any) => {
    if (!user) return true;
    const username = user.Username || '';
    const firstName = user.FirstName || '';
    return username.includes('Anony') || firstName.includes('Anony');
  },

  getValidToken: async () => {
    let accessToken = await tokenHelper.getAccessTokenFromCookies();

    return accessToken;
  },
};
