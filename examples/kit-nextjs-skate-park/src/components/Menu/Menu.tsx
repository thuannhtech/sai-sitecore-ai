"use client";
import React from 'react';
import { LinkField, Link } from '@sitecore-content-sdk/nextjs';

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

// Sub-component cho đệ quy
const NavigationMenu = ({ allItems, currentNodes, level, isEditing, getChildren }: any) => {
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
        const classNames = `menu-item rel-level${level} ${hasChildren ? "has-children" : ""}`.trim();

        // Lấy text hiển thị từ Link field text, fallback về URL segment
        const linkText = menu?.Link?.value?.text?.trim();
        let fallbackText = "Menu Item";
        if (currentUrl) {
          const parts = currentUrl.split('/');
          fallbackText = parts[parts.length - 1].replace(/-/g, " ") || "Menu Item";
          fallbackText = fallbackText.charAt(0).toUpperCase() + fallbackText.slice(1);
        }
        const displayText = linkText || fallbackText;

        return (
          <li key={item.id || index} className={classNames}>
            <div className="menu-item__title">
              <div className="menu-link-wrapper">
                {menu?.Link && 'Link' in menu ? (
                  // Dùng Link component của Sitecore — tự xử lý cả edit/view mode
                  <Link
                    field={menu.Link}
                    onClick={isEditing ? (e: React.MouseEvent) => e.preventDefault() : undefined}
                  >
                    {!linkText ? <span>{displayText}</span> : undefined}
                  </Link>
                ) : (
                  // Fallback khi không có Link field
                  <a href={menu?.Link?.value?.href || '#'}>
                    <span>{displayText}</span>
                  </a>
                )}
              </div>

              {hasChildren && (
                <svg className="menu-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              )}
            </div>

            {hasChildren && (
              <NavigationMenu
                allItems={allItems}
                currentNodes={children}
                level={level + 1}
                isEditing={isEditing}
                getChildren={getChildren}
              />
            )}
          </li>
        );
      })}

      {isEditing && currentNodes.length === 0 && level === 1 && (
        <li className="menu-item menu-item--empty">
          No menu items. Add child items in Content Tree.
        </li>
      )}
    </ul>
  );
};


// Component Chính
export const Default = (props: Props) => {
  const { fields, params, page } = props;
  const isEditing = page?.mode?.isEditing || false;

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
      if (!hasParent) {
        roots.push(item);
      }
    }

    // 2. If the user pointed their parameter specifically at the "MenuFolder" bucket, it has no UI layout representation.
    // We detect this because the folder won't have custom Fields hydrated. So we bypass it and use its exact children instead.
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
            if (remaining.indexOf('/') === -1) { // Exact single-level descendant 
              folderChildren.push(x);
            }
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
      if (remaining.indexOf('/') === -1) {
        result.push(x);
      }
    }
    return result;
  };

  const styles = `${params?.GridParameters || ''} ${params?.styles || ''}`.trim();

  return (
    <div className={`component menu menu-folder ${styles} ${isEditing ? 'sc-edit-mode' : ''}`} id={params?.RenderingIdentifier}>
      <nav aria-label="Main menu">
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
