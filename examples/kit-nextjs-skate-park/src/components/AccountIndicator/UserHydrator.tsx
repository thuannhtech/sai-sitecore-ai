'use client';

import { useRef } from 'react';
import { MeUser } from 'ordercloud-javascript-sdk';
import { useUserStore } from 'src/lib/user/store';

interface UserHydratorProps {
  user: MeUser | null;
}

/**
 * A client-side component that hydrates the UserStore with data fetched on the server.
 * This ensures the UI reflects the authentication state immediately without a client-side fetch.
 */
export const UserHydrator: React.FC<UserHydratorProps> = ({ user }) => {
  const hasHydrated = useRef(false);

  if (!hasHydrated.current) {
    const isGuest = (user as any)?.isGuest ?? true;
    
    // Update the store's state directly during the first render
    useUserStore.setState({ 
      user, 
      isAuthenticated: !!user && !isGuest, 
      isGuest,
      loading: false 
    });
    hasHydrated.current = true;
  }

  return null;
};
