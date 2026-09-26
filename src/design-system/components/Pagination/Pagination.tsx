import type { ReactNode } from 'react';
import styled from 'styled-components';
import { designTokens as t } from '../../tokens/designTokens';

type PaginationItem = number | 'ellipsis-left' | 'ellipsis-right';

export interface PaginationLabels {
  previous: string;
  next: string;
  navigation: string;
  goToPage(page: number): string;
  currentPage(page: number): string;
}

export interface PaginationProps {
  page: number;
  pages: number;
  onPageChange(page: number): void;
  labels: PaginationLabels;
  className?: string;
}

const Root = styled.nav`
  min-inline-size: 0;
  font-family: ${t.font.family.ui};
`;

const Controls = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: ${t.space[2]};
`;

const Pages = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: ${t.space[1]};
`;

const PageButton = styled.button<{ $current?: boolean }>`
  min-inline-size: 44px;
  min-block-size: 44px;
  padding-inline: ${t.space[2]};
  border: 1px solid ${({ $current }) => $current ? t.color.border.strong : t.color.border.subtle};
  border-radius: ${t.radius[2]};
  background: ${({ $current }) => $current ? t.color.bg.subtle : t.color.bg.surface};
  color: ${t.color.text.primary};
  font: inherit;
  cursor: pointer;

  &:hover:not(:disabled) { border-color: ${t.color.border.strong}; }

  &:focus-visible {
    outline: ${t.focus.ring.width} solid ${t.color.focus.ring};
    outline-offset: ${t.focus.ring.offset};
  }

  &:disabled {
    cursor: not-allowed;
    color: ${t.color.state.disabled.fg};
    background: ${t.color.state.disabled.bg};
    border-color: ${t.color.state.disabled.border};
  }
`;

const DirectionButton = styled(PageButton)`
  min-inline-size: 96px;
`;

const Ellipsis = styled.span`
  min-inline-size: 32px;
  min-block-size: 44px;
  display: inline-grid;
  place-items: center;
  color: ${t.color.text.secondary};
`;

export function getPaginationItems(page: number, pages: number): PaginationItem[] {
  if (pages <= 0) return [];
  if (pages <= 7) return Array.from({ length: pages }, (_, index) => index + 1);

  if (page <= 3) return [1, 2, 3, 'ellipsis-right', pages];
  if (page >= pages - 2) return [1, 'ellipsis-left', pages - 2, pages - 1, pages];

  return [1, 'ellipsis-left', page - 1, page, page + 1, 'ellipsis-right', pages];
}

function renderItem(
  item: PaginationItem,
  page: number,
  labels: PaginationLabels,
  onPageChange: (nextPage: number) => void
): ReactNode {
  if (typeof item !== 'number') {
    return <Ellipsis key={item} aria-hidden="true">…</Ellipsis>;
  }

  const current = item === page;
  return (
    <PageButton
      key={item}
      type="button"
      $current={current}
      aria-current={current ? 'page' : undefined}
      aria-label={current ? labels.currentPage(item) : labels.goToPage(item)}
      onClick={() => onPageChange(item)}
    >
      {item}
    </PageButton>
  );
}

export function Pagination({
  page,
  pages,
  onPageChange,
  labels,
  className,
}: PaginationProps) {
  if (pages <= 1) return null;

  return (
    <Root className={className} aria-label={labels.navigation}>
      <Controls>
        <DirectionButton
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          {labels.previous}
        </DirectionButton>

        <Pages>
          {getPaginationItems(page, pages).map(item =>
            renderItem(item, page, labels, onPageChange)
          )}
        </Pages>

        <DirectionButton
          type="button"
          disabled={page >= pages}
          onClick={() => onPageChange(page + 1)}
        >
          {labels.next}
        </DirectionButton>
      </Controls>
    </Root>
  );
}
