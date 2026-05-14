'use client';

import { useEffect } from 'react';
import { MeUser } from 'ordercloud-javascript-sdk';
import { useUserStore } from 'src/lib/user/store';

interface UserHydratorProps {
  user: MeUser | null;
}

export const UserHydrator: React.FC<UserHydratorProps> = ({ user }) => {
  useEffect(() => {
    const isGuest = user?.Username === 'SitecoreAIBuyerAnonymousUser';

    useUserStore.setState({ 
      user, 
      isAuthenticated: !!user && !isGuest, 
      isGuest,
      loading: false 
    });
  }, [user]);

  return null;
};
