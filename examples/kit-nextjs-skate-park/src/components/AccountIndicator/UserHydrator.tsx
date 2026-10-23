'use client';

import { useEffect } from 'react';
import { MeUser } from 'ordercloud-javascript-sdk';
import { trackUserLoginEvent } from '@sitecore-search/react';
import { useUserStore } from 'src/lib/user/store';
import { tokenHelper } from 'src/lib/ordercloud/token-helper';

const SITECORE_SEARCH_LOGIN_EVENT = 'sitecore-search:user-login';

interface UserHydratorProps {
  user: MeUser | null;
}

export const UserHydrator: React.FC<UserHydratorProps> = ({ user }) => {
  useEffect(() => {
    const isGuest = tokenHelper.isGuestProfile(user);
    useUserStore.setState({ 
      user, 
      isAuthenticated: !!user && !isGuest, 
      isGuest,
      loading: false 
    });

  }, [user]);

  useEffect(() => {
    const handleSearchLogin = (event: Event) => {
      const { id, email, onComplete } = (event as CustomEvent<{
        id?: string;
        email?: string;
        onComplete?: () => void;
      }>).detail ?? {};

      if (!id || !email) {
        console.warn('[Sitecore Search] Skipping login event: user ID and email are required.');
        onComplete?.();
        return;
      }

      void trackUserLoginEvent({ id, email }).catch((error) => {
        console.warn('[Sitecore Search] trackUserLoginEvent error:', error);
      }).finally(() => onComplete?.());
    };

    document.addEventListener(SITECORE_SEARCH_LOGIN_EVENT, handleSearchLogin);
    return () => document.removeEventListener(SITECORE_SEARCH_LOGIN_EVENT, handleSearchLogin);
  }, []);

  return null;
};
