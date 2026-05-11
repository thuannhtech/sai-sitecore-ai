'use client';

import React, { useState } from 'react';
import { User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useUserStore } from 'src/lib/user/store';
import { Link, useRouter } from 'src/i18n/navigation';
import { MeUser } from 'ordercloud-javascript-sdk';

interface SkateAccountIndicatorProps {
  user?: MeUser | null;
}

export const SkateAccountIndicator: React.FC<SkateAccountIndicatorProps> = ({ user: initialUser }) => {
  const { user: storeUser, isAuthenticated: storeAuth } = useUserStore();
  const [isOpen, setIsOpen] = useState(false);

  const user = storeUser || initialUser;
  const isAuthenticated = storeAuth || !!initialUser;
  const displayName = user ? `${user.FirstName} ${user.LastName}` : 'Sign in / Sign up';

  if (!isAuthenticated) {
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
            {user?.FirstName}
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
          href="/account"
          className="flex items-center gap-3 px-4 py-3 text-sm font-medium !text-gray-700 hover:bg-gray-50 transition-colors mx-2 rounded-xl"
        >
          <Settings size={16} className="!text-gray-400" />
          <span>My Account</span>
        </Link>

        <div className="h-px bg-gray-50 my-1 mx-2"></div>

        <Link
          href="/logout"
          className="flex items-center gap-3 px-4 py-3 text-sm font-medium !text-red-600 hover:bg-red-50 transition-colors mx-2 rounded-xl"
        >
          <LogOut size={16} className="!text-red-600" />
          <span>Logout</span>
        </Link>
      </div>
    </div>
  );
};
