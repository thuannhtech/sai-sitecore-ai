"use client";
import React, { useState } from 'react';
import { LinkField, Link } from '@sitecore-content-sdk/nextjs';
import { useLocale } from 'next-intl';

interface MenuFields {
  Link?: LinkField;
}

interface MenuItem {
  url: string | { path: string };
  fields: MenuFields;
  id?: string;
}

interface MenuFolderFields {
  Menus?: MenuItem[];
  items?: MenuItem[];
}

type Props = {
  params: any;
  fields: MenuFolderFields;
  page?: any;
};

// Utils
const getUrlStr = (urlField: any): string => {
  if (!urlField) return "";
  const str = typeof urlField === 'string' ? urlField : urlField.path || "";
  return str.replace(/\/$/, '');
};

// Helper: prepend locale to a Sitecore LinkField href
const localizeField = (field: LinkField | undefined, locale: string): LinkField | undefined => {
  if (!field?.value?.href) return field;
  const href = field.value.href;
  if (href.startsWith('http') || href.startsWith('//') || href.startsWith('#')) return field;
  if (href.startsWith(`/${locale}/`) || href === `/${locale}`) return field;
  const normalizedHref = href.startsWith('/') ? href : `/${href}`;
  return {
    ...field,
    value: {
      ...field.value,
      href: `/${locale}${normalizedHref}`
    }
  };
};

// Sub-component cho đệ quy
const NavigationMenu = ({ allItems, currentNodes, level, isEditing, getChildren }: any) => {
  const locale = useLocale();
  const [openSubMenus, setOpenSubMenus] = useState<{ [key: string]: boolean }>({});

  const toggleSubMenu = (id: string, e: React.MouseEvent) => {
    // Only toggle on mobile (we'll detect by window width or just let CSS handle visibility)
    // But logic-wise, we toggle the state
    setOpenSubMenus(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
    e.stopPropagation();
  };

  if (!currentNodes?.length && !(isEditing && level === 1)) {
    return null;
  }

  return (
    <ul className={`menu-list level-${level}`}>
      {currentNodes.map((item: any, index: number) => {
        const menu = item.fields as MenuFields;
        const currentUrl = getUrlStr(item.url);
        const children = getChildren(allItems, currentUrl);
        const hasChildren = children.length > 0;
        const itemId = item.id || `menu-${level}-${index}`;
        const isSubOpen = openSubMenus[itemId];

        const classNames = [
          'menu-item',
          `rel-level${level}`,
          hasChildren ? "has-children" : "",
          isSubOpen ? "is-sub-open" : ""
        ].filter(Boolean).join(' ');

        // Lấy text hiển thị
        const linkText = menu?.Link?.value?.text?.trim();
        let fallbackText = "Menu Item";
        if (currentUrl) {
          const parts = currentUrl.split('/');
          fallbackText = parts[parts.length - 1].replace(/-/g, " ") || "Menu Item";
          fallbackText = fallbackText.charAt(0).toUpperCase() + fallbackText.slice(1);
        }
        const displayText = linkText || fallbackText;
        const localizedLink = isEditing ? menu?.Link : localizeField(menu?.Link, locale);

        return (
          <li key={itemId} className={classNames}>
            <div className="menu-item__title">
              <div className="menu-link-wrapper">
                {localizedLink && 'value' in localizedLink ? (
                  <Link
                    field={localizedLink}
                    onClick={isEditing ? (e: React.MouseEvent) => e.preventDefault() : undefined}
                  >
                    {!linkText ? <span>{displayText}</span> : undefined}
                  </Link>
                ) : (
                  <a href={`/${locale}${menu?.Link?.value?.href || '/'}`}>
                    <span>{displayText}</span>
                  </a>
                )}
              </div>

              {hasChildren && (
                <div className="menu-arrow-wrapper" onClick={(e) => toggleSubMenu(itemId, e)}>
                  <svg className="menu-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
              )}
            </div>

            {hasChildren && (
              <div className={`menu-submenu-container ${isSubOpen ? 'is-open' : ''}`}>
                <NavigationMenu
                  allItems={allItems}
                  currentNodes={children}
                  level={level + 1}
                  isEditing={isEditing}
                  getChildren={getChildren}
                />
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
};


// Component Chính
export const Default = (props: Props) => {
  const { fields, params, page } = props;
  const isEditing = page?.mode?.isEditing || false;
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const rawItems = fields?.Menus || fields?.items || [];
  const allItems = rawItems.map((x: any) => ({
    ...x,
    urlStr: getUrlStr(x.url)
  }));

  let roots: any[] = [];
  if (allItems.length > 0) {
    for (const item of allItems) {
      const itemUrl = item.urlStr;
      let hasParent = false;
      for (const p of allItems) {
        const pUrl = p.urlStr;
        if (itemUrl.length > pUrl.length && itemUrl.toLowerCase().startsWith(pUrl.toLowerCase() + '/')) {
          hasParent = true;
          break;
        }
      }
      if (!hasParent) roots.push(item);
    }

    if (roots.length === 1) {
      const singleRoot = roots[0];
      const menu = singleRoot.fields;
      if (!menu?.Title?.value && (!menu?.Link || !menu?.Link?.value?.href)) {
        const pUrl = singleRoot.urlStr;
        const folderChildren: any[] = [];
        for (const x of allItems) {
          const u = x.urlStr;
          if (u.length > pUrl.length && u.toLowerCase().startsWith(pUrl.toLowerCase() + '/')) {
            const remaining = u.substring(pUrl.length + 1);
            if (remaining.indexOf('/') === -1) folderChildren.push(x);
          }
        }
        roots = folderChildren;
      }
    }
  }

  const getChildren = (all: any[], parentUrl: string) => {
    const pUrl = getUrlStr(parentUrl);
    const result = [];
    for (const x of all) {
      const u = x.urlStr;
      if (u.length <= pUrl.length) continue;
      if (!u.toLowerCase().startsWith(pUrl.toLowerCase() + '/')) continue;
      const remaining = u.substring(pUrl.length + 1);
      if (remaining.indexOf('/') === -1) result.push(x);
    }
    return result;
  };

  const styles = `${params?.GridParameters || ''} ${params?.styles || ''}`.trim();

  return (
    <div className={`component menu menu-folder ${styles} ${isEditing ? 'sc-edit-mode' : ''} ${isMenuOpen ? 'is-menu-open' : ''}`} id={params?.RenderingIdentifier}>
      <div className="menu-mobile-bar">
        <div className="menu-mobile-title">Menu</div>
        <button
          className={`menu-hamburger ${isMenuOpen ? 'is-active' : ''}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      <nav aria-label="Main menu" className={`menu-nav ${isMenuOpen ? 'is-open' : ''}`}>
        <NavigationMenu
          allItems={allItems}
          currentNodes={roots}
          level={1}
          isEditing={isEditing}
          getChildren={getChildren}
        />
      </nav>
    </div>
  );
};
