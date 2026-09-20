import { ArrowLeft } from 'lucide-react';
import { useCallback, useRef } from 'react';
import styled from 'styled-components';
import { IconButton } from '../../../design-system/components/IconButton';
import { designTokens as t } from '../../../design-system/tokens/designTokens';
import { useFocusScope } from '../hooks/useFocusScope';
import { SearchContent, type SearchProductSuggestion, type SearchStatus } from './SearchContent';

const Shell = styled.section`
  position: fixed;
  inset: 0;
  z-index: var(--layer-overlay);
  inline-size: 100%;
  block-size: 100dvh;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding-block-start: env(safe-area-inset-top);
  padding-block-end: calc(${t.space[8]} + env(safe-area-inset-bottom));
  padding-inline: ${t.container.padding.mobile};
  background: ${t.color.bg.surface};
  font-family: ${t.font.family.ui};

  [data-search-top-row] {
    min-block-size: 64px;
  }

  @media (min-width: ${t.breakpoint.md}) {
    padding-inline: ${t.container.padding.md};
  }

  @media (min-width: ${t.breakpoint.lg}) {
    display: none;
  }
`;

export interface MobileSearchShellProps {
  query: string;
  status: SearchStatus;
  suggestions: readonly SearchProductSuggestion[];
  onQueryChange(value: string): void;
  onSubmit(): void;
  onClose(): void;
}

export function MobileSearchShell({
  query,
  status,
  suggestions,
  onQueryChange,
  onSubmit,
  onClose,
}: MobileSearchShellProps) {
  const rootRef = useRef<HTMLElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const getContainers = useCallback(() => rootRef.current ? [rootRef.current] : [], []);
  const getInitialFocus = useCallback(() => inputRef.current, []);

  useFocusScope({ active: true, getContainers, getInitialFocus, onEscape: onClose });

  return (
    <Shell ref={rootRef} aria-label="Vyhledávání">
      <SearchContent
        query={query}
        status={status}
        suggestions={suggestions}
        inputRef={inputRef}
        onQueryChange={onQueryChange}
        onSubmit={onSubmit}
        leadingAction={(
          <IconButton
            aria-label="Zavřít vyhledávání"
            icon={<ArrowLeft aria-hidden="true" />}
            variant="ghost"
            onClick={onClose}
          />
        )}
      />
    </Shell>
  );
}
