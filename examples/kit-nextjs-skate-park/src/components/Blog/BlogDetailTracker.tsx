'use client';

import { useEffect } from 'react';
import { useLocale } from 'next-intl';
import { PageController, trackEntityPageViewEvent } from '@sitecore-search/react';

interface BlogDetailTrackerProps {
  itemId?: string;
  title?: string;
}

export const BlogDetailTracker = ({ itemId, title }: BlogDetailTrackerProps) => {
  const locale = useLocale();

  useEffect(() => {
    if (!itemId) return;

    const rawId = itemId.replace(/[{}-]/g, '').toUpperCase();
    const cleanId = rawId.includes('_') ? rawId.split('_')[0] : rawId;
    const targetLang = (locale || 'en').toLowerCase().startsWith('vi') ? 'vi-VN' : 'en';
    const entityId = `${cleanId}_${targetLang}`;

    // 1. Cung cấp entity context cho PageController để các widget con nhận diện document đang xem
    PageController.getContext().setEntityIds('blogitem', [
      entityId,
      `${cleanId}_en`,
      cleanId,
    ]);

    // 2. Bắn sự kiện Entity Page View cho blogitem sang Sitecore Search Telemetry
    try {
      void trackEntityPageViewEvent('blogitem', {
        items: [
          {
            id: entityId,
          },
        ],
      }).catch((err) => {
        console.warn('[Sitecore Search] trackEntityPageViewEvent (blogitem) error:', err);
      });
    } catch (err) {
      console.warn('[Sitecore Search] Failed to dispatch trackEntityPageViewEvent (blogitem):', err);
    }
  }, [itemId, locale]);

  return null;
};
