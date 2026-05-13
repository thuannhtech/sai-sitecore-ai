import { create } from 'zustand';
import { MeUser } from 'ordercloud-javascript-sdk';
import { authService } from '../ordercloud/auth';
import { isUserToken, isAnonymousToken } from '../ordercloud/token-utils';

interface UserState {
  user: MeUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  isGuest: boolean;
  fetchUser: () => Promise<void>;
  clearUser: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  loading: false,
  isAuthenticated: typeof window !== 'undefined' ? authService.isAuthenticated() : false,
  isGuest: typeof window !== 'undefined' ? isAnonymousToken(authService.getToken() || "") : true,

  fetchUser: async () => {
    console.log("fetchUser called")

    if (!authService.isAuthenticated()) {
      set({ user: null, isAuthenticated: false, isGuest: true, loading: false });
      return;
    }

    set({ loading: true });
    try {
      const response = await fetch('/api/customer/me');
      const data = await response.json();

      if (!data.ok) {
        throw new Error(data.error || 'Failed to fetch profile');
      }

      const user = data.user;
      const isGuest = data.isGuest;

      set({
        user,
        isAuthenticated: !isGuest,
        isGuest: !!isGuest,
        loading: false
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      const token: any = authService.getToken() || "";
      set({
        user: null,
        isAuthenticated: isUserToken(token),
        isGuest: isAnonymousToken(token),
        loading: false
      });
    }
  },

  clearUser: () => {
    set({ user: null, isAuthenticated: false, isGuest: true, loading: false });
  },
}));
