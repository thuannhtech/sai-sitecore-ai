'use client';

import React, { useState } from 'react';
import { User, LogOut, Settings, ChevronDown, Loader2 } from 'lucide-react';
import { useUserStore } from 'src/lib/user/store';
import { useSkateCartStore } from 'src/lib/cart/store';
import { Link, useRouter } from 'src/i18n/navigation';
import { MeUser } from 'ordercloud-javascript-sdk';
import { tokenHelper } from 'src/lib/ordercloud/token-helper';

interface SkateAccountIndicatorProps {
  user?: MeUser | null;
}

export const SkateAccountIndicator: React.FC<SkateAccountIndicatorProps> = ({ user: initialUser }) => {
  const { user: storeUser, isAuthenticated, isGuest, clearUser } = useUserStore();
  const { clearCart } = useSkateCartStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const hasStoreUser = !!storeUser;
  const user: any = storeUser || initialUser;
  const effectiveIsGuest = hasStoreUser ? isGuest : tokenHelper.isGuestProfile(initialUser);
  const effectiveIsAuthenticated = hasStoreUser
    ? isAuthenticated
    : !!initialUser && !effectiveIsGuest;
  const displayName = effectiveIsGuest
    ? 'Sign in / Sign up'
    : `${user?.FirstName ?? ''} ${user?.LastName ?? ''}`.trim() || 'Account';

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isLoggingOut) return;

    try {
      setIsLoggingOut(true);

      // 1. Call API to clear server-side cookies
      await fetch('/api/auth/logout', { method: 'POST' });

      // 2. Clear local data
      if (typeof window !== 'undefined') {
        // Clear stores
        clearUser();
        clearCart();

        // Clear all session storage (as requested: "xóa hết các sessionStorage")
        sessionStorage.clear();

        // Also clear common localStorage keys just in case
        localStorage.removeItem('ordercloud.token'); // Standard SDK token location
      }

      // 3. Redirect home via full reload to ensure clean state
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API fails, we should clear local state and redirect
      clearUser();
      clearCart();
      window.location.href = '/';
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (!effectiveIsAuthenticated || !user) {
    return (
      <Link
        href="/account/login"
        className="flex items-center gap-[8px] cursor-pointer transition-opacity duration-200 hover:opacity-80 group"
      >
        <div className="flex items-center">
          <User size={20} className="text-white" strokeWidth={2} />
        </div>
        <span className="text-[14px] font-normal text-white">
          {displayName}
        </span>
      </Link>
    );
  }

  return (
    <div
      className="relative group"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <div className="flex items-center gap-[8px] cursor-pointer py-2">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/30 transition-all group-hover:bg-white/30">
          <User size={16} className="text-white" strokeWidth={2.5} />
        </div>
        <div className="flex flex-col">
          <span className="text-[13px] font-bold text-white leading-none mb-0.5">
            {user?.FirstName} {user?.LastName}
          </span>
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-white/70 font-medium uppercase tracking-wider">Account</span>
            <ChevronDown size={10} className={`text-white/50 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </div>
      </div>

      {/* Dropdown Menu */}
      <div
        className={`z-999 absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 transition-all duration-300 origin-top-right z-50 text-gray-900 before:absolute before:-top-2 before:left-0 before:right-0 before:h-2 before:content-[''] ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
          }`}
      >
        <Link
          href="/account/my-account"
          className="flex items-center gap-3 px-4 py-3 text-[14px] font-medium !text-gray-700 hover:bg-gray-50 transition-colors mx-2 rounded-xl"
        >
          <Settings size={16} className="!text-gray-400" />
          <span>My Account</span>
        </Link>

        <div className="h-px bg-gray-50 my-1 mx-2"></div>

        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-[calc(100%-16px)] flex items-center gap-3 px-4 py-3 text-[14px] font-medium !text-red-600 hover:bg-red-50 transition-colors mx-2 rounded-xl text-left disabled:opacity-50"
        >
          {isLoggingOut ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <LogOut size={16} className="!text-red-600" />
          )}
          <span>{isLoggingOut ? 'Logout' : 'Logout'}</span>
        </button>
      </div>
    </div>
  );
};
