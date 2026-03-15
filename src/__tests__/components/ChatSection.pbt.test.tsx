// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import fc from 'fast-check';
import ChatSection from '@/components/ChatSection';

describe('ChatSection', () => {
  /**
   * Feature: design-system-application, Property 5: ChatSection displays greeting or default with agent name
   * Validates: Requirements 13.1
   */
  it('Property 5: ChatSection displays greeting or default with agent name', () => {
    fc.assert(
      fc.property(
        fc.record({
          agentName: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
          greeting: fc.option(
            fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
            { nil: undefined },
          ),
        }),
        ({ agentName, greeting }) => {
          const { container } = render(
            <ChatSection agentName={agentName} greeting={greeting} />,
          );

          const text = container.textContent ?? '';

          if (greeting !== undefined) {
            expect(text).toContain(greeting);
          } else {
            expect(text).toContain(agentName);
            expect(text).toContain('Chat coming soon');
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});
