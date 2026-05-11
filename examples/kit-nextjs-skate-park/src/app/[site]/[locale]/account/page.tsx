import React from 'react';
import { getServerUser } from 'src/lib/ordercloud/server-auth';
import { redirect } from 'next/navigation';

/**
 * My Account Page
 * Displays the profile information of the authenticated user.
 */
export default async function AccountPage({ params }: { params: { locale: string, site: string } }) {
  const user = await getServerUser();

  // If no user is found, redirect to login
  if (!user) {
    redirect(`/${params.locale}/account/login`);
  }

  return (
    <div className="w-full min-h-screen bg-white">
      <div className="flex flex-col md:flex-row min-h-screen">
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-72 bg-gray-50/50 border-r border-gray-100 p-8 flex flex-col gap-8">
          <div>
            <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-1">My Account</h1>
            <p className="text-[13px] text-gray-500 font-medium">Manage your settings</p>
          </div>

          <nav className="flex flex-col gap-1.5">
            <button className="flex items-center gap-3 text-left p-4 bg-white text-gray-900 rounded-2xl font-bold shadow-sm border border-gray-100 transition-all">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
              Profile Information
            </button>
            <button className="flex items-center gap-3 text-left p-4 text-gray-500 hover:bg-gray-100/50 rounded-2xl font-semibold transition-all">
              <span className="w-1.5 h-1.5 rounded-full bg-transparent"></span>
              Order History
            </button>
            <button className="flex items-center gap-3 text-left p-4 text-gray-500 hover:bg-gray-100/50 rounded-2xl font-semibold transition-all">
              <span className="w-1.5 h-1.5 rounded-full bg-transparent"></span>
              Addresses
            </button>
            <button className="flex items-center gap-3 text-left p-4 text-gray-500 hover:bg-gray-100/50 rounded-2xl font-semibold transition-all">
              <span className="w-1.5 h-1.5 rounded-full bg-transparent"></span>
              Payment Methods
            </button>
          </nav>

          <div className="mt-auto pt-8 border-t border-gray-100">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">Support</p>
            <button className="w-full text-left p-4 text-gray-600 hover:bg-gray-100 rounded-2xl font-medium transition-all text-sm">
              Contact Us
            </button>
          </div>
        </aside>

        {/* Profile Content */}
        <main className="flex-1 p-8 md:p-16 bg-white">
          <div className="max-w-3xl">
            <header className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Profile Details</h2>
              <p className="text-gray-500">View and update your personal information.</p>
            </header>
            
            <div className="bg-gray-50/30 rounded-[32px] border border-gray-100 p-8 md:p-12">
              <div className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.1em] block">First Name</label>
                    <p className="text-lg font-bold text-gray-900">{user.FirstName}</p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.1em] block">Last Name</label>
                    <p className="text-lg font-bold text-gray-900">{user.LastName}</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.1em] block">Email Address</label>
                  <p className="text-lg font-bold text-gray-900">{user.Email}</p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-100">
                    Verified
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.1em] block">Username</label>
                  <p className="text-lg font-bold text-gray-900">{user.Username}</p>
                </div>
              </div>

              <div className="mt-16 pt-10 border-t border-gray-100 flex gap-4">
                 <button className="px-10 py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-gray-800 transition-all shadow-lg shadow-gray-200">
                   Edit Profile
                 </button>
                 <button className="px-10 py-4 bg-white text-gray-900 font-bold rounded-2xl border border-gray-200 hover:bg-gray-50 transition-all">
                   Change Password
                 </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
