import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styled, { css } from 'styled-components';
import { designTokens as t } from '../../tokens/designTokens';
import { Spinner } from '../Spinner';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
export type ButtonSize = 'default' | 'compact';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
}

const variantStyles = {
  primary: css`
    color: ${t.color.action.primary.fg};
    background: ${t.color.action.primary.bg};
    border-color: transparent;
    &:hover:not(:disabled) { background: ${t.color.action.primary.bgHover}; }
    &:active:not(:disabled) { background: ${t.color.action.primary.bgActive}; }
  `,
  secondary: css`
    color: ${t.color.action.secondary.fg};
    background: ${t.color.action.secondary.bg};
    border-color: ${t.color.action.secondary.border};
    &:hover:not(:disabled) {
      background: ${t.color.action.secondary.bgHover};
      border-color: ${t.color.action.secondary.borderHover};
    }
    &:active:not(:disabled) {
      background: ${t.color.action.secondary.bgActive};
      border-color: ${t.color.action.secondary.borderHover};
    }
  `,
  ghost: css`
    color: ${t.color.action.ghost.fg};
    background: ${t.color.action.ghost.bg};
    border-color: transparent;
    &:hover:not(:disabled) { background: ${t.color.action.ghost.bgHover}; }
    &:active:not(:disabled) { background: ${t.color.action.ghost.bgActive}; }
  `,
  destructive: css`
    color: ${t.color.action.destructive.fg};
    background: ${t.color.action.destructive.bg};
    border-color: transparent;
    &:hover:not(:disabled) { background: ${t.color.action.destructive.bgHover}; }
    &:active:not(:disabled) { background: ${t.color.action.destructive.bgActive}; }
  `,
};

const StyledButton = styled.button<{ $variant: ButtonVariant; $size: ButtonSize; $loading: boolean }>`
  position: relative;
  min-inline-size: 0;
  block-size: ${({ $size }) => ($size === 'compact' ? t.control.height.compact : t.control.height.default)};
  padding-inline: ${({ $size }) => ($size === 'compact' ? t.component.button.paddingInline.compact : t.component.button.paddingInline.default)};
  border: 1px solid transparent;
  border-radius: ${t.component.button.radius};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${t.component.button.iconGap};
  font-family: ${t.font.family.ui};
  font-size: ${t.type.button.size};
  line-height: ${t.type.button.lineHeight};
  font-weight: ${t.type.button.weight};
  letter-spacing: ${t.type.button.letterSpacing};
  text-decoration: none;
  cursor: pointer;
  transition:
    background-color ${t.motion.fast} ease,
    border-color ${t.motion.fast} ease,
    color ${t.motion.fast} ease,
    transform ${t.motion.fast} ease;
  ${({ $variant }) => variantStyles[$variant]};

  &:active:not(:disabled) { transform: translateY(1px); }

  &:focus-visible {
    outline: ${t.focus.ring.width} solid ${t.color.focus.ring};
    outline-offset: ${t.focus.ring.offset};
  }

  &:disabled {
    cursor: not-allowed;
    transform: none;
    color: ${t.color.state.disabled.fg};
    background: ${({ $variant }) => ($variant === 'ghost' ? 'transparent' : t.color.state.disabled.bg)};
    border-color: ${({ $variant }) => ($variant === 'secondary' ? t.color.state.disabled.border : 'transparent')};
  }

  ${({ $loading }) => $loading && css`pointer-events: none;`}
`;

const Label = styled.span<{ $hidden: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: ${t.component.button.iconGap};
  color: ${({ $hidden }) => ($hidden ? 'transparent' : 'inherit')};
`;

const LoadingSpinner = styled.span`
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
`;

export function Button({
  variant = 'primary',
  size = 'default',
  loading = false,
  startIcon,
  endIcon,
  children,
  disabled,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <StyledButton
      {...props}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      $variant={variant}
      $size={size}
      $loading={loading}
    >
      <Label $hidden={loading}>
        {startIcon}
        {children}
        {endIcon}
      </Label>
      {loading ? (
        <LoadingSpinner aria-hidden="true">
          <Spinner size="sm" />
        </LoadingSpinner>
      ) : null}
    </StyledButton>
  );
}
