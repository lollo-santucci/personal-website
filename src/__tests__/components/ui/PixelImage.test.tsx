// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import PixelImage from '@/components/ui/PixelImage';

afterEach(cleanup);

describe('PixelImage', () => {
  describe('pixel-art class', () => {
    it('applies pixel-art class for pixelated rendering', () => {
      render(<PixelImage src="/sprite.png" scale={2} alt="A sprite" width={16} height={16} />);
      const img = screen.getByRole('img');
      expect(img).toHaveClass('pixel-art');
    });
  });

  describe('integer scaling dimensions', () => {
    it('renders at 2× scale: 16×16 → 32×32', () => {
      render(<PixelImage src="/sprite.png" scale={2} alt="Sprite" width={16} height={16} />);
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('width', '32');
      expect(img).toHaveAttribute('height', '32');
    });

    it('renders at 3× scale: 16×16 → 48×48', () => {
      render(<PixelImage src="/sprite.png" scale={3} alt="Sprite" width={16} height={16} />);
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('width', '48');
      expect(img).toHaveAttribute('height', '48');
    });

    it('renders at 4× scale: 32×24 → 128×96', () => {
      render(<PixelImage src="/sprite.png" scale={4} alt="Sprite" width={32} height={24} />);
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('width', '128');
      expect(img).toHaveAttribute('height', '96');
    });
  });

  describe('alt attribute', () => {
    it('renders with the provided alt text', () => {
      render(<PixelImage src="/sprite.png" scale={2} alt="Player character" width={16} height={16} />);
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('alt', 'Player character');
    });
  });
});
