/**
 * Utility functions for handling OrderCloud tokens on both client and server.
 */

/**
 * Decodes the payload of a JWT token without verification.
 */
export const decodeToken = (token: string) => {
  try {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = parts[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');

    let jsonPayload: string;
    if (typeof window !== 'undefined') {
      jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
    } else {
      jsonPayload = Buffer.from(base64, 'base64').toString('utf8');
    }

    return JSON.parse(jsonPayload);
  } catch (e) {
    console.warn('[Token Utils] Failed to decode token', e);
    return null;
  }
};

/**
 * Checks if the token was issued to the anonymous client ID.
 */
export const isAnonymousToken = (token: string) => {
  if (!token) return true;

  const decoded = decodeToken(token);
  const anonClientId = process.env.NEXT_PUBLIC_ORDERCLOUD_CLIENT_ID_ANNO;

  return decoded?.cid?.toString().toLowerCase() === anonClientId?.toLowerCase();
};

/**
 * Checks if the user profile belongs to a guest user based on naming conventions.
 */
export const isGuestProfile = (user: any) => {
  if (!user) return true;
  const username = user.Username || '';
  const firstName = user.FirstName || '';
  return username.includes('Anony') || firstName.includes('Anony');
};

/**
 * Checks if the token belongs to a real authenticated user.
 */
export const isUserToken = (token: string) => {
  if (!token) return false;
  return !isAnonymousToken(token);
};
