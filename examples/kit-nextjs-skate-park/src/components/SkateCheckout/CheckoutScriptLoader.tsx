'use client';

import { useEffect } from 'react';

export const CheckoutScriptLoader = () => {
  useEffect(() => {
    // Chỉ nạp checkout.js sau khi React đã hydrate xong hoàn toàn trên client
    const loadScript = () => {
      const existing = document.querySelector('script[src="/storefront/js/checkout.js"]');
      if (existing) {
        if (typeof (window as any).SkateCheckoutBridge?.init === 'function') {
          (window as any).SkateCheckoutBridge.init();
        }
        return;
      }

      const script = document.createElement('script');
      script.src = '/storefront/js/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    };

    if (typeof window !== 'undefined') {
      if (document.readyState === 'complete') {
        const timer = setTimeout(loadScript, 50);
        return () => clearTimeout(timer);
      } else {
        window.addEventListener('load', loadScript, { once: true });
        return () => window.removeEventListener('load', loadScript);
      }
    }
  }, []);

  return null;
};
