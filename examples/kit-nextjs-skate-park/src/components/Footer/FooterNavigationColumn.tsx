import React from 'react';
import { Link as ContentSdkLink, Text } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { Field, LinkField } from '@sitecore-content-sdk/nextjs';

interface FooterNavigationColumnProps extends ComponentProps {
  fields: {
    data: {
      datasource: {
        header?: { jsonValue: Field<string> };
        items?: {
          results: Array<{
            link: { jsonValue: LinkField };
          }>;
        };
      };
    };
  };
}

export const Default = ({ fields }: FooterNavigationColumnProps) => {
  const datasource = fields?.data?.datasource;

  if (!datasource) {
    return null;
  }

  const { header, items } = datasource;

  return (
    <nav className="footer-nav-column">
      {header?.jsonValue?.value && (
        <h3 className="footer-nav-column__title">
          <Text field={header.jsonValue} />
        </h3>
      )}
      <ul className="footer-nav-column__list">
        {items?.results?.map((item, index) => (
          <li key={`footer-nav-link-${index}`} className="footer-nav-column__item">
            <ContentSdkLink
              field={item.link?.jsonValue}
              className="footer-nav-column__link"
            />
          </li>
        ))}
      </ul>
    </nav>
  );
};
