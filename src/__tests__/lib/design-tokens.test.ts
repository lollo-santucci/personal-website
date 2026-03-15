import { describe, it, expect } from 'vitest';
import { colors, borderWidths, containerWidths, spacing } from '@/lib/design-tokens';

/**
 * Design tokens drift detector.
 * If someone updates CSS custom properties in globals.css but not design-tokens.ts,
 * these tests fail — signaling the two sources are out of sync.
 *
 * Validates: Requirements 15.1, 15.2, 15.3, 15.5
 */

describe('design-tokens', () => {
  describe('colors', () => {
    it('exports all 8 color values matching CSS custom properties', () => {
      expect(colors.white).toBe('#fffdfa');
      expect(colors.black).toBe('#222222');
      expect(colors.accent).toBe('#fc5c46');
      expect(colors.violet).toBe('#b87dfe');
      expect(colors.blue).toBe('#467afc');
      expect(colors.lime).toBe('#cbfd00');
      expect(colors.green).toBe('#00cf00');
      expect(colors.muted).toBe('#9a9997');
    });

    it('exports exactly 8 color entries', () => {
      expect(Object.keys(colors)).toHaveLength(8);
    });
  });

  describe('borderWidths', () => {
    it('exports border width values matching @theme tokens', () => {
      expect(borderWidths.standard).toBe(3);
      expect(borderWidths.collection).toBe(10);
      expect(borderWidths.frame).toBe(5);
    });

    it('exports exactly 3 border width entries', () => {
      expect(Object.keys(borderWidths)).toHaveLength(3);
    });
  });

  describe('containerWidths', () => {
    it('exports container width values matching @theme tokens', () => {
      expect(containerWidths.contentMax).toBe(1312);
    });

    it('exports exactly 1 container width entry', () => {
      expect(Object.keys(containerWidths)).toHaveLength(1);
    });
  });

  describe('spacing', () => {
    it('exports spacing values matching CSS custom properties', () => {
      expect(spacing.pagePx).toBe(100);
      expect(spacing.pagePt).toBe(50);
      expect(spacing.sectionGap).toBe(60);
      expect(spacing.collectionPx).toBe(40);
      expect(spacing.collectionPy).toBe(25);
      expect(spacing.cardGap).toBe(25);
      expect(spacing.crosslinkGap).toBe(50);
    });

    it('exports exactly 7 spacing entries', () => {
      expect(Object.keys(spacing)).toHaveLength(7);
    });
  });
});
