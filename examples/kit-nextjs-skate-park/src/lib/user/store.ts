import { create } from 'zustand';
import { MeUser } from 'ordercloud-javascript-sdk';
import { authService } from '../ordercloud/auth';
import { tokenHelper } from '../ordercloud/token-helper';

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
  isAuthenticated: false,
  isGuest: true,

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
      console.warn("TOKEN__data", data)

      set({
        user,
        isAuthenticated: !isGuest,
        isGuest: !!isGuest,
        loading: false
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      const token = authService.getToken() || "";
      console.warn("TOKEN__", token)
      set({
        user: null,
        isAuthenticated: tokenHelper.isUserToken(token),
        isGuest: true,
        loading: false
      });
    }
  },

  clearUser: () => {
    set({ user: null, isAuthenticated: false, isGuest: true, loading: false });
  },
}));
