import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Default as SiteMetadata } from '@/components/site-metadata/SiteMetadata';
import { Page } from '@sitecore-content-sdk/nextjs';

// Test props use type assertions for edge case testing where invalid data is intentionally passed

// Mock page object with all required Page properties
const mockPageBase = {
  mode: {
    isEditing: false,
    isPreview: false,
    isNormal: true,
    name: 'normal' as const,
    designLibrary: { isVariantGeneration: false },
    isDesignLibrary: false,
  },
  layout: {
    sitecore: {
      context: {},
      route: null,
    },
  },
  locale: 'en',
} as Page;

describe('SiteMetadata Component', () => {
  const mockRendering = { componentName: 'SiteMetadata' };

  beforeEach(() => {
    // Clear document.head before each test to avoid interference
    document.head.querySelectorAll('title, meta, link').forEach((el) => el.remove());
  });

  it('renders with complete metadata fields', () => {
    const props = {
      fields: {
        title: { value: 'Page Title' },
        metadataTitle: { value: 'Meta Title' },
        metadataKeywords: { value: 'keyword1, keyword2, keyword3' },
        metadataDescription: { value: 'Page meta description for SEO' },
      },
      params: {},
      rendering: mockRendering,
      page: mockPageBase,
      componentMap: new Map(),
    };

    render(<SiteMetadata {...props} />);
    
    // Check if title is rendered (may be in container or document.head)
    const title = document.querySelector('title') || document.head.querySelector('title');
    expect(title).toBeInTheDocument();
    expect(title?.textContent).toBe('Meta Title');
    
    // Verify meta tags are rendered (check document.head as React 19 hoists them)
    const keywordsMeta = document.head.querySelector('meta[name="keywords"]');
    const descriptionMeta = document.head.querySelector('meta[name="description"]');
    const viewportMeta = document.head.querySelector('meta[name="viewport"]');
    const preconnectLink = document.head.querySelector('link[rel="preconnect"]');
    
    expect(keywordsMeta).toBeInTheDocument();
    expect(keywordsMeta).toHaveAttribute('content', 'keyword1, keyword2, keyword3');
    expect(descriptionMeta).toBeInTheDocument();
    expect(descriptionMeta).toHaveAttribute('content', 'Page meta description for SEO');
    expect(viewportMeta).toBeInTheDocument();
    expect(viewportMeta).toHaveAttribute('content', 'width=device-width, initial-scale=1');
    expect(preconnectLink).toBeInTheDocument();
    expect(preconnectLink).toHaveAttribute('href', 'https://fonts.googleapis.com');
  });

  it('uses title when metadataTitle is not provided', () => {
    const props = {
      fields: {
        title: { value: 'Fallback Title' },
        metadataKeywords: { value: 'keywords' },
        metadataDescription: { value: 'description' },
      },
      params: {},
      rendering: mockRendering,
      page: mockPageBase,
      componentMap: new Map(),
    };

    render(<SiteMetadata {...props} />);
    const title = document.head.querySelector('title');
    
    expect(title).toBeInTheDocument();
    expect(title?.textContent).toBe('Fallback Title');
  });

  it('does not render meta tags when keywords and description are empty', () => {
    const props = {
      fields: {
        title: { value: 'Title Only' },
        metadataKeywords: { value: '' },
        metadataDescription: { value: '' },
      },
      params: {},
      rendering: mockRendering,
      page: mockPageBase,
      componentMap: new Map(),
    };

    const { container } = render(<SiteMetadata {...props} />);
    
    const keywordsMeta = container.querySelector('meta[name="keywords"]');
    const descriptionMeta = container.querySelector('meta[name="description"]');
    
    expect(keywordsMeta).not.toBeInTheDocument();
    expect(descriptionMeta).not.toBeInTheDocument();
  });

  it('handles missing optional fields gracefully', () => {
    const props = {
      fields: {
        title: { value: 'Minimal Title' },
      },
      params: {},
      rendering: mockRendering,
      page: mockPageBase,
      componentMap: new Map(),
    };

    render(<SiteMetadata {...props} />);
    const title = document.head.querySelector('title');
    
    expect(title).toBeInTheDocument();
    expect(title?.textContent).toBe('Minimal Title');
  });

  it('renders all required HTML meta tags with correct attributes', () => {
    const props = {
      fields: {
        metadataTitle: { value: 'SEO Title' },
        metadataKeywords: { value: 'seo, react, testing' },
        metadataDescription: { value: 'SEO optimized description' },
      },
      params: {},
      rendering: mockRendering,
      page: mockPageBase,
      componentMap: new Map(),
    };

    render(<SiteMetadata {...props} />);

    const keywordsMeta = document.head.querySelector('meta[name="keywords"]');
    const descriptionMeta = document.head.querySelector('meta[name="description"]');
    const viewportMeta = document.head.querySelector('meta[name="viewport"]');
    const preconnectLink = document.head.querySelector('link[rel="preconnect"]');

    expect(keywordsMeta).toBeInTheDocument();
    expect(keywordsMeta).toHaveAttribute('content', 'seo, react, testing');
    expect(descriptionMeta).toBeInTheDocument();
    expect(descriptionMeta).toHaveAttribute('content', 'SEO optimized description');
    expect(viewportMeta).toBeInTheDocument();
    expect(viewportMeta).toHaveAttribute('content', 'width=device-width, initial-scale=1');
    expect(preconnectLink).toBeInTheDocument();
    expect(preconnectLink).toHaveAttribute('href', 'https://fonts.googleapis.com');
  });

  it('handles empty field values correctly', () => {
    const props = {
      fields: {
        title: { value: undefined },
        metadataTitle: { value: undefined },
        metadataKeywords: { value: undefined },
        metadataDescription: { value: undefined },
      },
      params: {},
      rendering: mockRendering,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(() => render(<SiteMetadata {...(props as any)} />)).not.toThrow();
  });
});
