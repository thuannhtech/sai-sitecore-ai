"use client";
import React from 'react';
import { Field, LinkField, Text, Link } from '@sitecore-content-sdk/nextjs';

interface MenuFields {
  Link?: LinkField;
  ShowInMenu?: Field<boolean>;
  Title?: Field<string>;
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

        // Bỏ qua item nếu ShowInMenu false (trừ phi đang ở chế độ Edit)
        // if (!isEditing && menu?.ShowInMenu && menu.ShowInMenu.value === false) {
        //   return null;
        // }

        const currentUrl = getUrlStr(item.url);
        const children = getChildren(allItems, currentUrl);
        const hasChildren = children.length > 0;
        const classNames = `menu-item rel-level${level} ${hasChildren ? "has-children" : ""}`.trim();

        // Folders may not have a populated Title field. Use Url-based fallback name.
        let folderFallback = "Folder";
        if (currentUrl) {
          const parts = currentUrl.split('/');
          folderFallback = parts[parts.length - 1].replace(/-/g, " ") || "Folder";
          // Viết hoa chữ cái đầu tiên cho đẹp
          folderFallback = folderFallback.charAt(0).toUpperCase() + folderFallback.slice(1);
        }

        const hasTitle = menu?.Title?.value && menu.Title.value.trim().length > 0;

        let TitleComponent = null;
        if (isEditing) {
          if (menu?.Title) {
            // Fix lỗi "[No text in field]": Bơm tên thư mục vào nếu field Title bị rỗng lúc render
            const mockTitle = (!menu.Title.value || menu.Title.value.trim() === '')
              ? { ...menu.Title, value: folderFallback }
              : menu.Title;
            TitleComponent = <Text field={mockTitle as any} />;
          } else {
            // Thư mục gốc không có Field Title
            TitleComponent = <>{folderFallback}</>;
          }
        } else {
          // Ở chế độ xem bình thường, nếu có Title thì dùng Text, còn lại dùng Fallback
          TitleComponent = hasTitle ? <Text field={menu?.Title as any} /> : <>{folderFallback}</>;
        }

        return (
          <li key={item.id || index} className={classNames}>
            <div className="menu-item__title">
              <div className="menu-link-wrapper">
                {isEditing ? (
                  // BẮT BUỘC TÁCH RIÊNG: Để tránh lỗi Sitecore tự xóa Title lúc Save (Nesting Edit Bug),
                  // ta sẽ thiết kế một cụm UI gồm 2 phần độc lập cho Editor:
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <a href={menu?.Link?.value?.href || '#'} onClick={(e) => e.preventDefault()}>
                      {TitleComponent}
                    </a>

                    {/* Chỉ render nút cho phép sửa đường dẫn Link nếu field Link tồn tại */}
                    {menu && 'Link' in menu && menu.Link !== undefined && (
                      <Link field={menu.Link} style={{ backgroundColor: '#f0f0f0', border: '1px dashed #999', padding: '2px 6px', fontSize: '11px', borderRadius: '4px', textDecoration: 'none', color: '#333' }}>
                        [Edit Link]
                      </Link>
                    )}
                  </div>
                ) : menu?.Link?.value?.href ? (
                  <Link field={menu.Link}>
                    {TitleComponent}
                  </Link>
                ) : (
                  // Fallback khi không có Link
                  <a href="#">
                    {TitleComponent}
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
