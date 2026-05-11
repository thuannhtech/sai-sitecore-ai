import { cookies } from 'next/headers';
import { Me } from './index';
import { MeUser } from 'ordercloud-javascript-sdk';

/**
 * Server-side helper to get the authenticated user from cookies.
 * This can be used in Server Components, Server Actions, and Middleware.
 */
export const getServerUser = async (): Promise<MeUser | null> => {
  try {
    const cookieStore = await cookies();
    
    // 1. Try to get cached user data from cookie first to avoid API calls
    const cachedUser = cookieStore.get('skate-park.user-data')?.value;
    if (cachedUser) {
      try {
        return JSON.parse(decodeURIComponent(cachedUser));
      } catch (e) {
        console.warn('[OrderCloud Server Auth] Failed to parse cached user data');
      }
    }

    // 2. Fallback to API call if no cached data but token exists
    const token = cookieStore.get('skate-park.access-token')?.value;

    if (!token) {
      return null;
    }

    // Call OrderCloud Me.Get with the token from cookies
    const user = await Me.Get({ accessToken: token });
    return user;
  } catch (error) {
    // If token is invalid or expired, return null
    console.warn('[OrderCloud Server Auth] No valid session found');
    return null;
  }
};
