import styled, { keyframes } from 'styled-components';
import { designTokens as t } from '../../tokens/designTokens';

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg';

export interface SpinnerProps {
  size?: SpinnerSize;
  label?: string;
}

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const sizeMap: Record<SpinnerSize, string> = t.component.spinner.size;

const StyledSpinner = styled.span<{ $size: SpinnerSize }>`
  inline-size: ${({ $size }) => sizeMap[$size]};
  block-size: ${({ $size }) => sizeMap[$size]};
  display: inline-block;
  flex: 0 0 auto;
  border: ${t.component.spinner.stroke} solid currentColor;
  border-inline-end-color: transparent;
  border-radius: ${t.radius.full};
  animation: ${spin} ${t.motion.spinner} linear infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

export function Spinner({ size = 'sm', label }: SpinnerProps) {
  return (
    <StyledSpinner
      $size={size}
      role={label ? 'status' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
}
