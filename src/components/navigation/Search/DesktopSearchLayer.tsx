import { X } from 'lucide-react';
import { useCallback, useRef } from 'react';
import styled from 'styled-components';
import { Container } from '../../../design-system/components/Container';
import { IconButton } from '../../../design-system/components/IconButton';
import { designTokens as t } from '../../../design-system/tokens/designTokens';
import { useFocusScope } from '../hooks/useFocusScope';
import { SearchContent, type SearchProductSuggestion, type SearchStatus } from './SearchContent';

const Layer = styled.section`
  position: fixed;
  inset-block-start: 72px;
  inset-inline: 0;
  z-index: var(--layer-overlay);
  max-block-size: min(480px, calc(100dvh - 72px));
  overflow-y: auto;
  overscroll-behavior: contain;
  background: ${t.color.bg.surface};
  border-block-end: 1px solid ${t.color.border.subtle};
  box-shadow: ${t.shadow.md};
  font-family: ${t.font.family.ui};
`;

const Inner = styled(Container)`
  padding-block-start: ${t.space[6]};
  padding-block-end: ${t.space[8]};
`;

export interface DesktopSearchLayerProps {
  query: string;
  status: SearchStatus;
  suggestions: readonly SearchProductSuggestion[];
  onQueryChange(value: string): void;
  onSubmit(): void;
  onClose(): void;
}

export function DesktopSearchLayer({
  query,
  status,
  suggestions,
  onQueryChange,
  onSubmit,
  onClose,
}: DesktopSearchLayerProps) {
  const rootRef = useRef<HTMLElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const getContainers = useCallback(() => rootRef.current ? [rootRef.current] : [], []);
  const getInitialFocus = useCallback(() => inputRef.current, []);

  useFocusScope({ active: true, getContainers, getInitialFocus, onEscape: onClose });

  return (
    <Layer ref={rootRef} aria-label="Vyhledávání">
      <Inner>
        <SearchContent
          presentation="desktop"
          query={query}
          status={status}
          suggestions={suggestions}
          inputRef={inputRef}
          onQueryChange={onQueryChange}
          onSubmit={onSubmit}
          trailingAction={(
            <IconButton
              aria-label="Zavřít hledání"
              icon={<X aria-hidden="true" />}
              variant="ghost"
              onClick={onClose}
            />
          )}
        />
      </Inner>
    </Layer>
  );
}
