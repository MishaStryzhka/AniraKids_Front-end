import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styled, { css } from 'styled-components';
import { designTokens as t } from '../../tokens/designTokens';
import { Spinner } from '../Spinner';

export type IconButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
export type IconButtonSize = 'default' | 'large';

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  'aria-label': string;
  icon: ReactNode;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  loading?: boolean;
}

const variantStyles = {
  primary: css`
    color: ${t.color.action.primary.fg}; background: ${t.color.action.primary.bg}; border-color: transparent;
    &:hover:not(:disabled) { background: ${t.color.action.primary.bgHover}; }
    &:active:not(:disabled) { background: ${t.color.action.primary.bgActive}; }
  `,
  secondary: css`
    color: ${t.color.action.secondary.fg}; background: ${t.color.action.secondary.bg}; border-color: ${t.color.action.secondary.border};
    &:hover:not(:disabled) { background: ${t.color.action.secondary.bgHover}; border-color: ${t.color.action.secondary.borderHover}; }
    &:active:not(:disabled) { background: ${t.color.action.secondary.bgActive}; border-color: ${t.color.action.secondary.borderHover}; }
  `,
  ghost: css`
    color: ${t.color.action.ghost.fg}; background: transparent; border-color: transparent;
    &:hover:not(:disabled) { background: ${t.color.action.ghost.bgHover}; }
    &:active:not(:disabled) { background: ${t.color.action.ghost.bgActive}; }
  `,
  destructive: css`
    color: ${t.color.action.destructive.fg}; background: ${t.color.action.destructive.bg}; border-color: transparent;
    &:hover:not(:disabled) { background: ${t.color.action.destructive.bgHover}; }
    &:active:not(:disabled) { background: ${t.color.action.destructive.bgActive}; }
  `,
};

const StyledButton = styled.button<{ $variant: IconButtonVariant; $size: IconButtonSize }>`
  inline-size: ${({ $size }) => ($size === 'large' ? t.component.iconButton.size.large : t.component.iconButton.size.default)};
  block-size: ${({ $size }) => ($size === 'large' ? t.component.iconButton.size.large : t.component.iconButton.size.default)};
  flex: 0 0 auto;
  padding: 0;
  border: 1px solid transparent;
  border-radius: ${t.component.iconButton.radius};
  display: inline-grid;
  place-items: center;
  cursor: pointer;
  transition: background-color ${t.motion.fast} ease, border-color ${t.motion.fast} ease, color ${t.motion.fast} ease, transform ${t.motion.fast} ease;
  ${({ $variant }) => variantStyles[$variant]}

  &:focus-visible { outline: ${t.focus.ring.width} solid ${t.color.focus.ring}; outline-offset: ${t.focus.ring.offset}; }
  &:active:not(:disabled) { transform: translateY(1px); }
  &:disabled {
    cursor: not-allowed;
    transform: none;
    color: ${t.color.state.disabled.fg};
    background: ${({ $variant }) => ($variant === 'ghost' ? 'transparent' : t.color.state.disabled.bg)};
    border-color: ${({ $variant }) => ($variant === 'secondary' ? t.color.state.disabled.border : 'transparent')};
  }

  & > svg { inline-size: ${t.component.iconButton.iconSize}; block-size: ${t.component.iconButton.iconSize}; stroke-width: ${t.icon.strokeWidth}; }
`;

export function IconButton({ icon, variant = 'ghost', size = 'default', loading = false, disabled, type = 'button', ...props }: IconButtonProps) {
  return (
    <StyledButton {...props} type={type} disabled={disabled || loading} aria-busy={loading || undefined} $variant={variant} $size={size}>
      {loading ? <Spinner size="sm" /> : icon}
    </StyledButton>
  );
}
