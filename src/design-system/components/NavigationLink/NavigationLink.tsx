import type { ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import styled, { css } from 'styled-components';
import { designTokens as t } from '../../tokens/designTokens';

export type NavigationLinkVariant = 'navigation' | 'plain';

export interface NavigationLinkProps extends Omit<LinkProps, 'className' | 'style'> {
  variant: NavigationLinkVariant;
  children: ReactNode;
}

const StyledLink = styled(Link)<{ $variant: NavigationLinkVariant }>`
  position: relative;
  min-block-size: ${t.component.navigationLink.minHeight};
  display: inline-flex;
  align-items: center;
  color: ${({ $variant }) => $variant === 'navigation' ? t.color.text.primary : t.color.text.secondary};
  background: ${t.color.bg.transparent};
  text-decoration: none;
  transition: color ${t.motion.fast} ease;

  ${({ $variant }) => $variant === 'navigation' ? css`
    padding-inline: ${t.component.navigationLink.navigation.paddingInline};
    font-family: ${t.font.family.ui};
    font-size: ${t.type.label.size};
    line-height: ${t.type.label.lineHeight};
    font-weight: ${t.type.label.weight};
    letter-spacing: ${t.type.label.letterSpacing};

    &[aria-current='page']::after {
      content: '';
      position: absolute;
      inset-inline: ${t.component.navigationLink.navigation.paddingInline};
      inset-block-end: ${t.component.navigationLink.current.indicatorOffset};
      block-size: ${t.component.navigationLink.current.indicatorWidth};
      background: ${t.color.action.primary.bg};
    }
  ` : css`
    padding-inline: 0;
  `}

  &[aria-current='page'] { color: ${t.color.text.primary}; }
  &:hover { color: ${t.color.action.ghost.fg}; }
  &:active { color: ${t.color.action.primary.bgActive}; }

  &:focus-visible {
    outline: ${t.focus.ring.width} solid ${t.color.focus.ring};
    outline-offset: ${t.focus.ring.offset};
    border-radius: ${t.radius[1]};
  }
`;

export function NavigationLink({ variant, children, ...props }: NavigationLinkProps) {
  return <StyledLink {...props} $variant={variant}>{children}</StyledLink>;
}
