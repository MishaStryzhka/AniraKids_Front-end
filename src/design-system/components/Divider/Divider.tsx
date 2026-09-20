import styled from 'styled-components';
import { designTokens as t } from '../../tokens/designTokens';

export interface DividerProps {
  decorative?: boolean;
  className?: string;
}

const Rule = styled.hr`
  inline-size: 100%;
  block-size: ${t.component.divider.thickness};
  margin: 0;
  border: 0;
  background: ${t.color.border.subtle};
`;

export function Divider({ decorative = true, className }: DividerProps) {
  return <Rule className={className} aria-hidden={decorative || undefined} role={decorative ? 'presentation' : 'separator'} />;
}
