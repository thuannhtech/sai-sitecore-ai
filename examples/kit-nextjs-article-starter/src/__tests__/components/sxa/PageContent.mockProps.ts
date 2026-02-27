import { RichTextField } from '@sitecore-content-sdk/nextjs';

// Mock rich text field with content
export const mockContentField: RichTextField = {
  value: '<p>This is page content</p><h2>Heading</h2><ul><li>Item 1</li><li>Item 2</li></ul>',
};

export const mockEmptyContentField: RichTextField = {
  value: '',
};

// Mock useSitecore context
export const mockSitecoreContext = {
  page: {
    layout: {
      sitecore: {
        route: {
          fields: {
            Content: {
              value: '<p>Content from route</p>',
            },
          },
        },
      },
    },
    mode: {
      isEditing: false,
      isPreview: false,
    },
  },
};

export const mockSitecoreContextWithoutContent = {
  page: {
    layout: {
      sitecore: {
        route: {
          fields: {},
        },
      },
    },
    mode: {
      isEditing: false,
      isPreview: false,
    },
  },
};

// Default props with content field
export const defaultProps = {
  params: {
    Styles: 'custom-page-content-style',
    RenderingIdentifier: 'page-content-id',
  },
  fields: {
    Content: mockContentField,
  },
};

// Props with empty content
export const propsWithEmptyContent = {
  params: {
    Styles: 'empty-content-style',
    RenderingIdentifier: 'empty-content-id',
  },
  fields: {
    Content: mockEmptyContentField,
  },
};

// Props without styles
export const propsWithoutStyles = {
  params: {
    Styles: '',
    RenderingIdentifier: 'no-style-id',
  },
  fields: {
    Content: mockContentField,
  },
};

// Props without RenderingIdentifier
export const propsWithoutId = {
  params: {
    Styles: 'custom-style',
    RenderingIdentifier: '',
  },
  fields: {
    Content: mockContentField,
  },
};

// Props without fields
export const propsWithoutFields = {
  params: {
    Styles: 'no-fields-style',
    RenderingIdentifier: 'no-fields-id',
  },
  fields: undefined as unknown as typeof defaultProps.fields,
};

// Props without Content field
export const propsWithoutContentField = {
  params: {
    Styles: 'no-content-field',
    RenderingIdentifier: 'no-content-field-id',
  },
  fields: {} as unknown as typeof defaultProps.fields,
};

// Props with undefined params
export const propsWithUndefinedParams = {
  params: {} as typeof defaultProps.params,
  fields: {
    Content: mockContentField,
  },
};

// Props with null content field
export const propsWithNullContent = {
  params: {
    Styles: 'null-content',
    RenderingIdentifier: 'null-content-id',
  },
  fields: {
    Content: null as unknown as RichTextField,
  },
};

