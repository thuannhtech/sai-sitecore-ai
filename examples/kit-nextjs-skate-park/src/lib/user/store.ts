import { create } from 'zustand';
import { MeUser } from 'ordercloud-javascript-sdk';
import { userService } from '../ordercloud/user';
import { authService } from '../ordercloud/auth';

interface UserState {
  user: MeUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  fetchUser: () => Promise<void>;
  clearUser: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  loading: false,
  isAuthenticated: typeof window !== 'undefined' ? authService.isAuthenticated() : false,

  fetchUser: async () => {

    console.log("fetchUser called")

    if (!authService.isAuthenticated()) {
      set({ user: null, isAuthenticated: false, loading: false });
      return;
    }

    set({ loading: true });
    try {
      const user = await userService.getUser();
      console.log("user", user)
      set({ user, isAuthenticated: true, loading: false });
    } catch (error) {
      console.error('Error fetching user:', error);
      set({ user: null, isAuthenticated: false, loading: false });
    }
  },

  clearUser: () => {
    set({ user: null, isAuthenticated: false, loading: false });
  },
}));
