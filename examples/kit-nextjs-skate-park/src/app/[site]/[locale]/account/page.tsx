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
    <div className="max-w-4xl mx-auto py-20 px-6">
      <div className="mb-12">
        <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tight mb-2">My Account</h1>
        <p className="text-gray-500">Manage your profile and account settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Navigation Sidebar */}
        <div className="md:col-span-1">
          <nav className="flex flex-col gap-2">
            <button className="text-left p-4 bg-gray-900 text-white rounded-2xl font-bold transition-all">
              Profile Information
            </button>
            <button className="text-left p-4 bg-white text-gray-600 hover:bg-gray-50 rounded-2xl font-medium transition-all">
              Order History
            </button>
            <button className="text-left p-4 bg-white text-gray-600 hover:bg-gray-50 rounded-2xl font-medium transition-all">
              Addresses
            </button>
          </nav>
        </div>

        {/* Profile Content */}
        <div className="md:col-span-2">
          <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold mb-6">Profile Details</h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[13px] font-bold text-gray-400 uppercase tracking-wider block mb-1">First Name</label>
                  <p className="text-[16px] font-medium text-gray-900">{user.FirstName}</p>
                </div>
                <div>
                  <label className="text-[13px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Last Name</label>
                  <p className="text-[16px] font-medium text-gray-900">{user.LastName}</p>
                </div>
              </div>

              <div>
                <label className="text-[13px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Email Address</label>
                <p className="text-[16px] font-medium text-gray-900">{user.Email}</p>
              </div>

              <div>
                <label className="text-[13px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Username</label>
                <p className="text-[16px] font-medium text-gray-900">{user.Username}</p>
              </div>
            </div>

            <div className="mt-10 pt-10 border-t border-gray-50">
               <button className="px-8 py-3 bg-gray-100 text-gray-900 font-bold rounded-2xl hover:bg-gray-200 transition-all">
                 Edit Profile
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
