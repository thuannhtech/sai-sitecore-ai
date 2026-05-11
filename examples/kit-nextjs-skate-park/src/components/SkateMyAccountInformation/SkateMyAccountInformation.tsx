'use client';

import React from 'react';
import { useUserStore } from 'src/lib/user/store';
import { Settings, User, MapPin, CreditCard, ShoppingBag, Mail, Phone, ChevronRight } from 'lucide-react';

/**
 * SkateMyAccountInformation Component
 * Designed to be used in a Sitecore placeholder on the account page.
 * Uses client-side store for user data to ensure compatibility with all placeholder types.
 */
export const Default = (props: any) => {
  const { user, isAuthenticated } = useUserStore();

  if (!isAuthenticated || !user) {
    return (
      <div className="w-full py-20 flex flex-col items-center justify-center text-center px-4">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-400">
          <User size={40} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in to view your profile</h2>
        <p className="text-gray-500 mb-8 max-w-sm">Please sign in to access your account information, orders, and settings.</p>
        <a
          href="/account/login"
          className="px-10 py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-gray-800 transition-all shadow-lg shadow-gray-200"
        >
          Sign In
        </a>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-white">
      <div className="flex flex-col md:flex-row min-h-screen">
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-[300px] bg-gray-50/50 border-r border-gray-100 p-8 flex flex-col gap-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight mb-2">Account</h1>
            <p className="text-[13px] text-gray-500 font-medium leading-relaxed">Manage your profile, addresses and order preferences.</p>
          </div>

          <nav className="flex flex-col gap-2">
            <button className="flex items-center justify-between p-4 bg-white text-gray-900 rounded-2xl font-bold shadow-sm border border-gray-100 transition-all group">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-red-600"></div>
                <span>Profile Information</span>
              </div>
              <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-900 transition-colors" />
            </button>

            {[
              { icon: ShoppingBag, label: 'Order History' },
              { icon: MapPin, label: 'Addresses' },
              { icon: CreditCard, label: 'Payment Methods' }
            ].map((item, idx) => (
              <button key={idx} className="flex items-center justify-between p-4 text-gray-500 hover:bg-white hover:shadow-sm hover:border-gray-100 border border-transparent rounded-2xl font-semibold transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-transparent"></div>
                  <span>{item.label}</span>
                </div>
                <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 text-gray-300 transition-all" />
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-8 border-t border-gray-100">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">Support</p>
            <button className="w-full text-left p-4 text-gray-600 hover:bg-gray-100 rounded-2xl font-medium transition-all text-sm flex items-center gap-2">
              <Phone size={14} />
              Contact Support
            </button>
          </div>
        </aside>

        {/* Profile Content */}
        <main className="flex-1 p-8 md:p-16 lg:p-24 bg-white">
          <div className="max-w-4xl">
            <header className="mb-16">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-600">
                  <Settings size={32} strokeWidth={1.5} />
                </div>
                <div>
                  <h2 className="text-4xl font-black text-gray-900 tracking-tight">Personal Details</h2>
                  <p className="text-gray-500 font-medium">Keep your account information up to date.</p>
                </div>
              </div>
            </header>

            <div className="bg-gray-50/40 rounded-[40px] border border-gray-100 p-8 md:p-14 lg:p-20">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block">First Name</label>
                  <p className="text-xl font-bold text-gray-900 border-b-2 border-gray-100 pb-2">{user.FirstName || '—'}</p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block">Last Name</label>
                  <p className="text-xl font-bold text-gray-900 border-b-2 border-gray-100 pb-2">{user.LastName || '—'}</p>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block">Email Address</label>
                  <div className="flex items-center gap-4">
                    <p className="text-xl font-bold text-gray-900 border-b-2 border-gray-100 pb-2 flex-1">{user.Email}</p>
                    <div className="bg-green-500/10 text-green-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-green-500/20">
                      Verified
                    </div>
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block">Username</label>
                  <p className="text-xl font-bold text-gray-900 border-b-2 border-gray-100 pb-2">{user.Username}</p>
                </div>
              </div>

              <div className="mt-20 pt-12 border-t border-gray-100 flex flex-wrap gap-4">
                <button className="px-12 py-5 bg-gray-900 text-white font-bold rounded-2xl hover:bg-gray-800 transition-all shadow-xl shadow-gray-200">
                  Edit Profile
                </button>
                <button className="px-12 py-5 bg-white text-gray-900 font-bold rounded-2xl border border-gray-200 hover:bg-gray-50 transition-all">
                  Change Password
                </button>
              </div>
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-8 bg-gray-50/50 rounded-[32px] border border-gray-100">
                <Mail className="text-gray-400 mb-4" size={24} />
                <h4 className="font-bold text-gray-900 mb-1">Email Preferences</h4>
                <p className="text-sm text-gray-500">Manage how we communicate with you.</p>
              </div>
              <div className="p-8 bg-gray-50/50 rounded-[32px] border border-gray-100">
                <MapPin className="text-gray-400 mb-4" size={24} />
                <h4 className="font-bold text-gray-900 mb-1">Shipping Addresses</h4>
                <p className="text-sm text-gray-500">Add or remove your delivery locations.</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
