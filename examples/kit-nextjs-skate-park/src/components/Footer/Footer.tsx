import React from 'react';
import { LinkField } from '@sitecore-content-sdk/nextjs';
import { Link as ContentSdkLink, Text, AppPlaceholder } from '@sitecore-content-sdk/nextjs';
import componentMap from '.sitecore/component-map';
import { FooterProps } from './footer.props';

const SocialIcon = ({ platform }: { platform: string }): React.ReactElement | null => {
  const icons: Record<string, React.ReactElement> = {
    facebook: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
    instagram: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
    linkedin: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
  };
  return icons[platform.toLowerCase()] ?? null;
};

type SocialLinkItem = {
  field: LinkField;
  platform: string;
  label: string;
};

export const Default = ({ params, fields, rendering, page }: FooterProps) => {
  const id = params?.RenderingIdentifier;

  if (!fields) {
    return (
      <footer className="footer" id={id || undefined}>
        <div className="footer__inner">
          <p>Footer data not available.</p>
        </div>
      </footer>
    );
  }

  const { Title, CopyrightText, FacebookLink, InstagramLink, LinkedinLink } = fields;

  const socialLinks: SocialLinkItem[] = [
    { field: FacebookLink, platform: 'facebook', label: 'Facebook' },
    { field: InstagramLink, platform: 'instagram', label: 'Instagram' },
    { field: LinkedinLink, platform: 'linkedin', label: 'LinkedIn' },
  ].filter((s): s is SocialLinkItem => !!s.field);

  return (
    <footer className="footer" id={id || undefined}>
      {/* ── Main Footer Row with Multiple Placeholder Columns ── */}
      <div className="footer__row footer__row--main">
        <div className="footer__container footer__main-row">
          <div className="footer__column">
            <AppPlaceholder
              name="footer-primary-links"
              rendering={rendering}
              page={page}
              componentMap={componentMap}
            />
          </div>
          <div className="footer__column">
            <AppPlaceholder
              name="footer-secondary-links"
              rendering={rendering}
              page={page}
              componentMap={componentMap}
            />
          </div>
          <div className="footer__column">
            <AppPlaceholder
              name="footer-thirth-links"
              rendering={rendering}
              page={page}
              componentMap={componentMap}
            />
          </div>
          {/* Add more footer__column divs with AppPlaceholder as needed */}
        </div>
      </div>

      {/* ── Final Row: Social Icons + Copyright ── */}
      <div className="footer__row footer__row--final">
        <div className="footer__container">
          <div className="footer__final-flex">
            {socialLinks.length > 0 && (
              <div className="footer__social-icons">
                {socialLinks.map(({ field, platform, label }) => (
                  <ContentSdkLink
                    key={platform}
                    field={field}
                    className="footer__social-item"
                    aria-label={label}
                  >
                    <SocialIcon platform={platform} />
                  </ContentSdkLink>
                ))}
              </div>
            )}

            {CopyrightText?.value && (
              <Text
                field={CopyrightText}
                tag="p"
                className="footer__copyright-text"
                encode={false}
              />
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
