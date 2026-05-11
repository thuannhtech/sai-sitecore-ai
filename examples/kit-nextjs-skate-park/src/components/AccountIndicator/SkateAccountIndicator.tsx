'use client';

import React from 'react';
import { User } from 'lucide-react';
import { Link } from 'src/i18n/navigation';
import { MeUser } from 'ordercloud-javascript-sdk';
import { useUserStore } from 'src/lib/user/store';

interface SkateAccountIndicatorProps {
  user?: MeUser | null;
}

/**
 * Client Component version of Account Indicator.
 * Syncs with UserStore and supports initial server-side data to prevent flickering.
 */
export const SkateAccountIndicator: React.FC<SkateAccountIndicatorProps> = ({ user: initialUser }) => {
  const { user: storeUser, isAuthenticated: storeAuth } = useUserStore();
  
  // Use store data if available, fallback to initial server data
  const user = storeUser || initialUser;
  const isAuthenticated = storeAuth || !!initialUser;
  const displayName = user ? `${user.FirstName} ${user.LastName}` : 'Sign in / Sign up';

  return (
    <Link
      href={isAuthenticated ? "/account" : "/account/login"}
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
};
