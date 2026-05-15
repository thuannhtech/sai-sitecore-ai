'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useUserStore } from 'src/lib/user/store';
import {
  Calendar,
  ChevronRight,
  CreditCard,
  Mail,
  MapPin,
  Package,
  Phone,
  Settings,
  ShoppingBag,
  User,
} from 'lucide-react';
import SkateOrderDetail from 'src/components/SkateOrderDetail/SkateOrderDetail';
import { OrderHistoryItemViewModel } from 'src/lib/checkout/models';
import sitecoreConfig from 'sitecore.config';

type AccountView = 'profile' | 'orders' | 'order-detail';

declare global {
  interface Window {
    Swal?: {
      fire: (options: Record<string, unknown>) => Promise<unknown>;
    };
  }
}

const formatOrderDate = (value?: string) => {
  if (!value) return 'N/A';
  return new Date(value).toLocaleDateString();
};

const getSwal = async () => {
  if (typeof window === 'undefined') {
    return null;
  }

  if (window.Swal) {
    return window.Swal;
  }

  await new Promise<void>((resolve, reject) => {
    const existingScript = document.querySelector(
      'script[data-skate-swal="true"]'
    ) as HTMLScriptElement | null;

    if (existingScript) {
      if (window.Swal) {
        resolve();
        return;
      }

      existingScript.addEventListener('load', () => resolve(), { once: true });
      existingScript.addEventListener('error', () => reject(new Error('Failed to load SweetAlert2')), {
        once: true,
      });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/sweetalert2@11';
    script.dataset.skateSwal = 'true';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load SweetAlert2'));
    document.head.appendChild(script);
  });

  return window.Swal || null;
};

const mapOrderHistoryItem = (order: Record<string, any>): OrderHistoryItemViewModel => {
  const storefrontCheckout = order?.xp?.storefrontCheckout || order?.xp?.StorefrontCheckout || {};

  return {
    orderId: order?.ID || '',
    orderDate: order?.DateSubmitted || order?.DateCreated,
    status: order?.Status || order?.xp?.PaymentStatus || 'Open',
    total: Number(order?.Total) || 0,
    currency: order?.xp?.Currency || 'USD',
    shippingMethodName:
      order?.xp?.ShippingMethodName || storefrontCheckout?.shippingMethod?.name || 'Standard',
    paymentMethodLabel:
      storefrontCheckout?.paymentMethod?.label ||
      storefrontCheckout?.transaction?.description ||
      order?.xp?.PaymentMethod ||
      'Payment',
    itemCount: Number(order?.LineItemCount || storefrontCheckout?.cart?.itemCount) || 0,
  };
};

/**
 * SkateMyAccountInformation Component
 * Designed to be used in a Sitecore placeholder on the account page.
 * Uses client-side store for user data to ensure compatibility with all placeholder types.
 */
export const Default = (props: any) => {
  const { user, isAuthenticated } = useUserStore();
  const currentUserId = user?.ID || '';
  const t = useTranslations(sitecoreConfig.defaultSite || undefined);
  const [activeView, setActiveView] = useState<AccountView>('profile');
  const [orders, setOrders] = useState<OrderHistoryItemViewModel[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');
  const [ordersFetchedForUser, setOrdersFetchedForUser] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState('');

  const showComingSoon = async (featureName: string) => {
    try {
      const swal = await getSwal();
      if (swal) {
        await swal.fire({
          icon: 'info',
          title: 'Coming soon',
          text: `${featureName} is not available yet.`,
          confirmButtonText: 'OK',
        });
        return;
      }
    } catch (error) {
      console.error('[Account] Failed to load SweetAlert2:', error);
    }

    window.alert(`${featureName} is coming soon.`);
  };

  useEffect(() => {
    if (ordersFetchedForUser === currentUserId) {
      return;
    }

    setOrders([]);
    setOrdersError('');
    setOrdersFetchedForUser('');
  }, [currentUserId, ordersFetchedForUser]);

  useEffect(() => {
    if (
      !isAuthenticated ||
      !currentUserId ||
      activeView !== 'orders' ||
      ordersLoading ||
      ordersFetchedForUser === currentUserId
    ) {
      return;
    }

    const fetchOrders = async () => {
      setOrdersLoading(true);
      setOrdersError('');

      try {
        const response = await fetch('/api/orders?view=history', {
          method: 'GET',
          credentials: 'same-origin',
        });
        const result = await response.json().catch(() => ({}));

        if (!response.ok || !result.ok) {
          throw new Error(result.error || 'Failed to fetch order history');
        }

        setOrders((result.orders || []).map(mapOrderHistoryItem));
        setOrdersFetchedForUser(currentUserId);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to fetch order history';
        setOrdersError(message);
        setOrdersFetchedForUser(currentUserId);
      } finally {
        setOrdersLoading(false);
      }
    };

    void fetchOrders();
  }, [activeView, currentUserId, isAuthenticated, ordersFetchedForUser, ordersLoading]);

  if (!isAuthenticated || !user) {
    return (
      <div className="flex w-full flex-col items-center justify-center px-4 py-20 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-50 text-gray-400">
          <User size={40} />
        </div>
        <h2 className="mb-2 text-2xl font-bold text-gray-900">Sign in to view your profile</h2>
        <p className="mb-8 max-w-sm text-gray-500">
          Please sign in to access your account information, orders, and settings.
        </p>
        <a
          href="/account/login"
          className="rounded-2xl bg-gray-900 px-10 py-4 font-bold text-white shadow-lg shadow-gray-200 transition-all hover:bg-gray-800"
        >
          Sign In
        </a>
      </div>
    );
  }

  const navItems = [
    { key: 'profile' as const, icon: Settings, label: 'Profile Information', enabled: true },
    { key: 'orders' as const, icon: ShoppingBag, label: 'Order History', enabled: true },
    { key: 'addresses' as const, icon: MapPin, label: 'Addresses', enabled: false },
    { key: 'payments' as const, icon: CreditCard, label: 'Payment Methods', enabled: false },
  ];

  const renderProfile = () => (
    <>
      <header className="mb-16">
        <div className="mb-4 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <Settings size={32} strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-4xl font-black tracking-tight text-gray-900">Personal Details</h2>
            <p className="font-medium text-gray-500">Keep your account information up to date.</p>
          </div>
        </div>
      </header>

      <div className="rounded-[40px] border border-gray-100 bg-gray-50/40 p-8 md:p-14 lg:p-20">
        <div className="grid grid-cols-1 gap-x-16 gap-y-12 md:grid-cols-2">
          <div className="space-y-2">
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
              First Name
            </label>
            <p className="border-b-2 border-gray-100 pb-2 text-xl font-bold text-gray-900">
              {user.FirstName || '—'}
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
              Last Name
            </label>
            <p className="border-b-2 border-gray-100 pb-2 text-xl font-bold text-gray-900">
              {user.LastName || '—'}
            </p>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
              Email Address
            </label>
            <div className="flex items-center gap-4">
              <p className="flex-1 border-b-2 border-gray-100 pb-2 text-xl font-bold text-gray-900">
                {user.Email}
              </p>
              <div className="rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-green-600">
                Verified
              </div>
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
              Username
            </label>
            <p className="border-b-2 border-gray-100 pb-2 text-xl font-bold text-gray-900">
              {user.Username}
            </p>
          </div>
        </div>

        <div className="mt-20 flex flex-wrap gap-4 border-t border-gray-100 pt-12">
          <button
            type="button"
            onClick={() => void showComingSoon('Edit Profile')}
            className="rounded-2xl bg-gray-900 px-12 py-5 font-bold text-white shadow-xl shadow-gray-200 transition-all hover:bg-gray-800"
          >
            Edit Profile
          </button>
          <button
            type="button"
            onClick={() => void showComingSoon('Change Password')}
            className="rounded-2xl border border-gray-200 bg-white px-12 py-5 font-bold text-gray-900 transition-all hover:bg-gray-50"
          >
            Change Password
          </button>
        </div>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-[32px] border border-gray-100 bg-gray-50/50 p-8">
          <Mail className="mb-4 text-gray-400" size={24} />
          <h4 className="mb-1 font-bold text-gray-900">Email Preferences</h4>
          <p className="text-sm text-gray-500">Manage how we communicate with you.</p>
        </div>
        <div className="rounded-[32px] border border-gray-100 bg-gray-50/50 p-8">
          <MapPin className="mb-4 text-gray-400" size={24} />
          <h4 className="mb-1 font-bold text-gray-900">Shipping Addresses</h4>
          <p className="text-sm text-gray-500">Add or remove your delivery locations.</p>
        </div>
      </div>
    </>
  );

  const renderOrderHistory = () => (
    <>
      <header className="mb-12">
        <div className="mb-4 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <ShoppingBag size={30} strokeWidth={1.8} />
          </div>
          <div>
            <h2 className="text-4xl font-black tracking-tight text-gray-900">Order History</h2>
            <p className="font-medium text-gray-500">
              Review your recent orders and open any order for full details.
            </p>
          </div>
        </div>
      </header>

      {ordersLoading ? (
        <div className="space-y-4">
          {[0, 1, 2].map((item) => (
            <div key={item} className="animate-pulse rounded-[2rem] border border-gray-100 bg-gray-50 p-8">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div className="h-6 w-40 rounded-full bg-gray-200"></div>
                <div className="h-5 w-24 rounded-full bg-gray-200"></div>
              </div>
              <div className="grid gap-4 md:grid-cols-4">
                {[0, 1, 2, 3].map((detail) => (
                  <div key={detail}>
                    <div className="mb-2 h-3 w-20 rounded-full bg-gray-200"></div>
                    <div className="h-5 w-28 rounded-full bg-gray-100"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : ordersError ? (
        <div className="rounded-[2rem] border border-red-100 bg-red-50 px-8 py-10 text-red-600">
          <p className="mb-2 text-sm font-black uppercase tracking-[0.2em]">Unable to Load Orders</p>
          <p className="text-base font-medium">{ordersError}</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-[2rem] border border-gray-100 bg-gray-50 px-8 py-12 text-center">
          <Package size={32} className="mx-auto mb-4 text-gray-300" />
          <p className="mb-2 text-sm font-black uppercase tracking-[0.2em] text-gray-400">
            No Orders Yet
          </p>
          <p className="text-base font-medium text-gray-500">
            Your completed purchases will appear here once you place an order.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <button
              key={order.orderId}
              type="button"
              onClick={() => {
                setSelectedOrderId(order.orderId);
                setActiveView('order-detail');
              }}
              className="group w-full rounded-[2rem] border border-gray-100 bg-gray-50 p-8 text-left transition-all hover:-translate-y-0.5 hover:border-gray-200 hover:bg-white hover:shadow-lg hover:shadow-gray-100"
            >
              <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="mb-2 text-[12px] font-black uppercase tracking-[0.24em] text-blue-600">
                    Order #{order.orderId}
                  </p>
                  <h3 className="text-2xl font-black tracking-tight text-gray-900">
                    ${Number(order.total || 0).toLocaleString()}
                  </h3>
                </div>
                <div className="inline-flex items-center gap-2 self-start rounded-full bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-gray-500 shadow-sm">
                  View Details
                  <ChevronRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-4">
                <div>
                  <p className="mb-2 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">
                    Date
                  </p>
                  <div className="flex items-center gap-2 text-base font-bold text-gray-900">
                    <Calendar size={16} className="text-orange-600" />
                    {formatOrderDate(order.orderDate)}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">
                    Status
                  </p>
                  <p className="text-base font-bold text-gray-900">{order.status || 'Open'}</p>
                </div>
                <div>
                  <p className="mb-2 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">
                    Shipping
                  </p>
                  <p className="text-base font-bold text-gray-900">
                    {order.shippingMethodName || 'Standard'}
                  </p>
                </div>
                <div>
                  <p className="mb-2 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">
                    Payment
                  </p>
                  <p className="text-base font-bold text-gray-900">
                    {order.paymentMethodLabel || 'Payment'}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </>
  );

  const renderOrderDetail = () => {
    if (!selectedOrderId) {
      return null;
    }

    return (
      <SkateOrderDetail orderId={selectedOrderId} />
    );
  };

  return (
    <div className="min-h-screen w-full bg-white">
      <div className="flex min-h-screen flex-col md:flex-row">
        <aside className="flex w-full flex-col gap-8 border-r border-gray-100 bg-gray-50/50 p-8 md:w-[300px]">
          <div>
            <h1 className="mb-2 text-3xl font-black uppercase tracking-tight text-gray-900">
              {t.has('Account__SidebarTitle') ? t('Account__SidebarTitle') : 'Account'}
            </h1>
            <p className="text-[13px] font-medium leading-relaxed text-gray-500">
              Manage your profile, addresses and order preferences.
            </p>
          </div>

          <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.key === 'profile'
                  ? activeView === 'profile'
                  : item.key === 'orders'
                    ? activeView === 'orders' || activeView === 'order-detail'
                    : false;

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    if (!item.enabled) return;
                    setActiveView(item.key === 'profile' ? 'profile' : 'orders');
                  }}
                  className={`group flex items-center justify-between rounded-2xl border p-4 transition-all ${isActive
                    ? 'border-gray-100 bg-white font-bold text-gray-900 shadow-sm'
                    : 'border-transparent font-semibold text-gray-500'
                    } ${item.enabled ? 'hover:border-gray-100 hover:bg-white hover:shadow-sm' : 'cursor-not-allowed opacity-60'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full ${isActive ? 'bg-red-600' : 'bg-transparent'}`}></div>
                    <Icon size={16} className={isActive ? 'text-gray-900' : 'text-gray-400'} />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight
                    size={16}
                    className={`${item.enabled ? 'text-gray-300 opacity-100' : 'opacity-0'} transition-all group-hover:text-gray-900`}
                  />
                </button>
              );
            })}
          </nav>

          <div className="mt-auto border-t border-gray-100 pt-8">
            <p className="mb-4 text-[11px] font-bold uppercase tracking-widest text-gray-400">Support</p>
            <button className="flex w-full items-center gap-2 rounded-2xl p-4 text-left text-sm font-medium text-gray-600 transition-all hover:bg-gray-100">
              <Phone size={14} />
              Contact Support
            </button>
          </div>
        </aside>

        <main className="flex-1 bg-white p-8 md:p-16 lg:p-24">
          <div className="max-w-5xl">
            {activeView === 'profile' ? renderProfile() : null}
            {activeView === 'orders' ? renderOrderHistory() : null}
          </div>
          <div style={{ maxWidth: "1000px" }}>
            {activeView === 'order-detail' ? renderOrderDetail() : null}
          </div>
        </main>
      </div>
    </div>
  );
};
