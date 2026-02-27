import React from 'react';
import { render, screen } from '@testing-library/react';
import { Default as BackgroundThumbnail } from '@/components/background-thumbnail/BackgroundThumbnail.dev';

// Mock useSitecore hook
const mockUseSitecore = jest.fn();
jest.mock('@sitecore-content-sdk/nextjs', () => ({
  useSitecore: () => mockUseSitecore(),
}));

// Mock Badge component
jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, className }: { children?: React.ReactNode; className?: string }) => (
    <div className={className} data-testid="badge">
      {children}
    </div>
  ),
}));

describe('BackgroundThumbnail Component', () => {
  const mockChildren = <div data-testid="child-element">Child Content</div>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Normal mode (not editing)', () => {
    beforeEach(() => {
      mockUseSitecore.mockReturnValue({
        page: {
          mode: {
            isEditing: false,
          },
        },
      });
    });

    it('should render null when not in editing mode', () => {
      const { container } = render(<BackgroundThumbnail>{mockChildren}</BackgroundThumbnail>);
      expect(container.firstChild).toBeNull();
    });

    it('should not render children when not in editing mode', () => {
      render(<BackgroundThumbnail>{mockChildren}</BackgroundThumbnail>);
      expect(screen.queryByTestId('child-element')).not.toBeInTheDocument();
    });

    it('should not render badge when not in editing mode', () => {
      render(<BackgroundThumbnail>{mockChildren}</BackgroundThumbnail>);
      expect(screen.queryByTestId('badge')).not.toBeInTheDocument();
    });
  });

  describe('Editing mode', () => {
    beforeEach(() => {
      mockUseSitecore.mockReturnValue({
        page: {
          mode: {
            isEditing: true,
          },
        },
      });
    });

    it('should render when in editing mode', () => {
      const { container } = render(<BackgroundThumbnail>{mockChildren}</BackgroundThumbnail>);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should render children when in editing mode', () => {
      render(<BackgroundThumbnail>{mockChildren}</BackgroundThumbnail>);
      expect(screen.getByTestId('child-element')).toBeInTheDocument();
    });

    it('should render "Update Background" badge', () => {
      render(<BackgroundThumbnail>{mockChildren}</BackgroundThumbnail>);
      expect(screen.getByText('Update Background')).toBeInTheDocument();
    });

    it('should apply correct container classes', () => {
      const { container } = render(<BackgroundThumbnail>{mockChildren}</BackgroundThumbnail>);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('bg-primary', 'absolute', 'bottom-4', 'right-4', 'rounded-md');
    });

    it('should apply opacity and ring classes', () => {
      const { container } = render(<BackgroundThumbnail>{mockChildren}</BackgroundThumbnail>);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('opacity-50', 'ring-4', 'ring-offset-2', 'hover:opacity-100');
    });

    it('should position badge correctly', () => {
      render(<BackgroundThumbnail>{mockChildren}</BackgroundThumbnail>);
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('absolute', 'bottom-4', 'left-2/4', '-translate-x-2/4');
    });

    it('should apply nowrap and whitespace classes to badge', () => {
      render(<BackgroundThumbnail>{mockChildren}</BackgroundThumbnail>);
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('nowrap', 'whitespace-nowrap');
    });
  });

  describe('Different children types', () => {
    beforeEach(() => {
      mockUseSitecore.mockReturnValue({
        page: {
          mode: {
            isEditing: true,
          },
        },
      });
    });

    it('should render with image children', () => {
      // eslint-disable-next-line @next/next/no-img-element
      const imageChild = <img src="/test.jpg" alt="Test" data-testid="image-child" />;
      render(<BackgroundThumbnail>{imageChild}</BackgroundThumbnail>);
      expect(screen.getByTestId('image-child')).toBeInTheDocument();
    });

    it('should render with complex JSX children', () => {
      const complexChildren = (
        <div>
          <h1>Title</h1>
          <p>Description</p>
        </div>
      );
      render(<BackgroundThumbnail>{complexChildren}</BackgroundThumbnail>);
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
    });

    it('should render with multiple children elements', () => {
      const multipleChildren = (
        <>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
        </>
      );
      render(<BackgroundThumbnail>{multipleChildren}</BackgroundThumbnail>);
      expect(screen.getByTestId('child-1')).toBeInTheDocument();
      expect(screen.getByTestId('child-2')).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('should handle undefined children gracefully in editing mode', () => {
      mockUseSitecore.mockReturnValue({
        page: {
          mode: {
            isEditing: true,
          },
        },
      });

      const { container } = render(<BackgroundThumbnail>{undefined as unknown as React.ReactElement}</BackgroundThumbnail>);
      expect(container.firstChild).toBeInTheDocument();
      expect(screen.getByText('Update Background')).toBeInTheDocument();
    });

    it('should handle null children gracefully in editing mode', () => {
      mockUseSitecore.mockReturnValue({
        page: {
          mode: {
            isEditing: true,
          },
        },
      });

      const { container } = render(<BackgroundThumbnail>{null as unknown as React.ReactElement}</BackgroundThumbnail>);
      expect(container.firstChild).toBeInTheDocument();
      expect(screen.getByText('Update Background')).toBeInTheDocument();
    });
  });

  describe('useSitecore integration', () => {
    it('should call useSitecore hook', () => {
      mockUseSitecore.mockReturnValue({
        page: {
          mode: {
            isEditing: false,
          },
        },
      });

      render(<BackgroundThumbnail>{mockChildren}</BackgroundThumbnail>);
      expect(mockUseSitecore).toHaveBeenCalled();
    });

    it('should react to editing mode changes', () => {
      mockUseSitecore.mockReturnValue({
        page: {
          mode: {
            isEditing: false,
          },
        },
      });

      const { container, rerender } = render(<BackgroundThumbnail>{mockChildren}</BackgroundThumbnail>);
      expect(container.firstChild).toBeNull();

      mockUseSitecore.mockReturnValue({
        page: {
          mode: {
            isEditing: true,
          },
        },
      });

      rerender(<BackgroundThumbnail>{mockChildren}</BackgroundThumbnail>);
      expect(container.firstChild).toBeInTheDocument();
    });
  });
});


