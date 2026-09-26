import type { HTMLAttributes, ReactNode } from 'react';
import styled, { css } from 'styled-components';
import { designTokens as t } from '../../tokens/designTokens';

export type StatusBadgeTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

export interface StatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone: StatusBadgeTone;
  icon?: ReactNode;
}

const toneStyles = {
  info: css`
    color: ${t.color.status.info.strong};
    background: ${t.color.status.info.bg};
  `,
  success: css`
    color: ${t.color.status.success.strong};
    background: ${t.color.status.success.bg};
  `,
  neutral: css`
    color: ${t.color.text.secondary};
    background: ${t.color.bg.subtle};
  `,
  warning: css`
    color: ${t.color.status.warning.strong};
    background: ${t.color.status.warning.bg};
  `,
  danger: css`
    color: ${t.color.status.danger.strong};
    background: ${t.color.status.danger.bg};
  `,
};

const Root = styled.span<{ $tone: StatusBadgeTone }>`
  block-size: 28px;
  max-inline-size: 100%;
  padding-inline: ${t.space[2]};
  border-radius: ${t.radius.full};
  display: inline-flex;
  align-items: center;
  gap: ${t.space[1]};
  font-family: ${t.font.family.ui};
  font-size: ${t.type.caption.size};
  line-height: ${t.type.caption.lineHeight};
  font-weight: ${t.font.weight.semibold};
  letter-spacing: ${t.type.caption.letterSpacing};
  white-space: nowrap;
  ${({ $tone }) => toneStyles[$tone]}

  & > svg {
    inline-size: ${t.icon.size.sm};
    block-size: ${t.icon.size.sm};
    flex: 0 0 auto;
    stroke-width: ${t.icon.strokeWidth};
  }
`;

export function StatusBadge({ tone, icon, children, ...props }: StatusBadgeProps) {
  return (
    <Root {...props} $tone={tone}>
      {icon}
      <span>{children}</span>
    </Root>
  );
}
