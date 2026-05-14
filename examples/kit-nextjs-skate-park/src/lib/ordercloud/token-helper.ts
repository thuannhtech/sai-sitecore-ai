type GuestProfile = {
  Username?: string;
  FirstName?: string;
};

export const tokenHelper = {
  getAccessTokenFromCookies: async () => {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    return cookieStore.get('oc-token')?.value;
  },

  setAccessTokenInCookies: async (token: string) => {
    const { cookies } = await import('next/headers');
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
      console.warn('[Token Helper] Failed to decode token', e);
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

    return decoded?.cid?.toString().toLowerCase() === anonClientId?.toLowerCase();
  },

  /**
   * Checks if the user profile belongs to a guest user based on naming conventions.
   */
  isGuestProfile: (user: GuestProfile | null | undefined) => {
    if (!user) return true;
    const username = user.Username || '';
    const firstName = user.FirstName || '';
    return username.includes('Anony') || firstName.includes('Anony');
  },

  /**
   * Checks if the token belongs to a real authenticated user.
   */
  isUserToken: (token: string) => {
    if (!token) return false;
    return !tokenHelper.isAnonymousToken(token);
  },

  getValidToken: async () => {
    return await tokenHelper.getAccessTokenFromCookies();
  },
};
