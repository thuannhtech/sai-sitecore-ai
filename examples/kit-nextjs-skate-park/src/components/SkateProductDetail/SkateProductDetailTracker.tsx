'use client';

import { useEffect } from 'react';
import { useLocale } from 'next-intl';
import { PageController, trackEntityPageViewEvent } from '@sitecore-search/react';

interface SkateProductDetailTrackerProps {
  productId?: string;
}

export const SkateProductDetailTracker = ({ productId }: SkateProductDetailTrackerProps) => {
  const locale = useLocale();

  useEffect(() => {
    if (!productId) return;

    const pageUri = window.location.pathname;
    PageController.getContext().setPageUri(pageUri);

    const rawId = productId.replace(/[{}-]/g, '').toUpperCase();
    const cleanId = rawId.includes('_') ? rawId.split('_')[0] : rawId;
    const targetLang = (locale || 'en').toLowerCase().startsWith('vi') ? 'vi-VN' : 'en';
    const entityId = `${cleanId}_${targetLang}`;

    // 1. Cung cấp entity context cho PageController để các widget con (như More Like This) nhận biết
    PageController.getContext().setEntityIds('product', [
      entityId,
      `${cleanId}_en`,
      productId,
    ]);

    // 2. Bắn sự kiện Entity Page View sang Sitecore Search Telemetry để tính điểm Relevancy & Trending
    try {
      void trackEntityPageViewEvent('product', {
        items: [
          {
            id: entityId,
            uri: pageUri,
          },
        ],
      }).catch((err) => {
        console.warn('[Sitecore Search] trackEntityPageViewEvent error:', err);
      });
    } catch (err) {
      console.warn('[Sitecore Search] Failed to dispatch trackEntityPageViewEvent:', err);
    }
  }, [productId, locale]);

  return null;
};
