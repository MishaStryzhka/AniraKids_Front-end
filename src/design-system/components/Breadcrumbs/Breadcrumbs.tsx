import { ChevronRight } from 'lucide-react';
import styled from 'styled-components';
import { designTokens as t } from '../../tokens/designTokens';
import { NavigationLink } from '../NavigationLink';
import { useMediaQuery } from '../../../hooks/useMediaQuery';

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

export interface BreadcrumbsProps {
  items: readonly BreadcrumbItem[];
}

const Nav = styled.nav`
  min-inline-size: 0;
  font-family: ${t.font.family.ui};
  font-size: ${t.type.bodySm.size};
  line-height: ${t.type.bodySm.lineHeight};
`;

const List = styled.ol`
  min-block-size: ${t.component.breadcrumb.minHeight};
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  align-items: center;
  min-inline-size: 0;
  overflow: hidden;
`;

const Item = styled.li<{ $current?: boolean }>`
  display: inline-flex;
  align-items: center;
  min-inline-size: ${({ $current }) => $current ? 0 : 'auto'};
  flex: ${({ $current }) => $current ? '1 1 auto' : '0 0 auto'};
  color: ${({ $current }) => $current ? t.color.text.primary : t.color.text.secondary};
`;

const Current = styled.span`
  display: block;
  min-inline-size: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const Separator = styled(ChevronRight)`
  inline-size: ${t.component.breadcrumb.separatorSize};
  block-size: ${t.component.breadcrumb.separatorSize};
  margin-inline: ${t.component.breadcrumb.itemGap};
  flex: 0 0 auto;
  color: ${t.color.text.muted};
  stroke-width: ${t.icon.strokeWidth};
`;

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const isFullHierarchy = useMediaQuery(`(min-width: ${t.breakpoint.md})`);
  if (items.length === 0) return null;

  const visibleItems = isFullHierarchy || items.length <= 2 ? items : items.slice(-2);

  return (
    <Nav aria-label="Drobečková navigace">
      <List>
        {visibleItems.map((item, index) => {
          const isCurrent = index === visibleItems.length - 1;
          return (
            <Item key={`${item.label}-${index}`} $current={isCurrent}>
              {isCurrent ? (
                <Current aria-current="page">{item.label}</Current>
              ) : (
                <NavigationLink variant="plain" to={item.to as string}>{item.label}</NavigationLink>
              )}
              {!isCurrent ? <Separator aria-hidden="true" /> : null}
            </Item>
          );
        })}
      </List>
    </Nav>
  );
}
