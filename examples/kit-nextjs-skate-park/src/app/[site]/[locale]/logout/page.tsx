'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'src/i18n/navigation';
import { useUserStore } from 'src/lib/user/store';
import { Loader2, LogOut } from 'lucide-react';

/**
 * Logout Page with a 3-second countdown.
 * Handles clearing local state (Zustand) and server state (Cookies).
 */
export default function LogoutPage() {
  const router = useRouter();
  const clearUser = useUserStore((state) => state.clearUser);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const performLogout = async () => {
      // 1. Clear Zustand store immediately
      clearUser();

      // 2. Clear cookies via server-side API
      try {
        await fetch('/api/auth/logout', { method: 'POST' });
      } catch (err) {
        console.error('Logout API failed', err);
      }
    };

    performLogout();

    // 3. Countdown timer and redirect
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [clearUser, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FB]">
      <div className="max-w-md w-full p-10 bg-white rounded-[40px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] text-center space-y-8 border border-gray-100">
        <div className="relative inline-flex items-center justify-center w-24 h-24">
          <div className="absolute inset-0 bg-red-50 rounded-full animate-ping opacity-20"></div>
          <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-red-50 text-red-500">
            <LogOut size={44} strokeWidth={1.5} />
          </div>
        </div>
        
        <div className="space-y-3">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Logging Out</h1>
          <p className="text-gray-500 font-medium text-lg px-4 leading-relaxed">
            Closing your session safely. You will be back on the home page in...
          </p>
        </div>

        <div className="relative flex items-center justify-center py-4">
           <div className="text-7xl font-black text-red-500 transition-all duration-300 transform scale-110">
             {countdown}
           </div>
        </div>

        <div className="flex flex-col items-center gap-4 pt-4">
          <Loader2 className="animate-spin text-gray-200" size={32} />
          <p className="text-[11px] font-bold text-gray-300 uppercase tracking-widest">Securing your account</p>
        </div>
      </div>
    </div>
  );
}
