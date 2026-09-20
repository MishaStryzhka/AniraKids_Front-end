import type { HTMLAttributes } from 'react';
import styled from 'styled-components';
import { designTokens as t } from '../../tokens/designTokens';

const Root = styled.div`
  inline-size: 100%;
  max-inline-size: ${t.container.max};
  margin-inline: auto;
  padding-inline: ${t.container.padding.mobile};

  @media (min-width: ${t.breakpoint.md}) { padding-inline: ${t.container.padding.md}; }
  @media (min-width: ${t.breakpoint.lg}) { padding-inline: ${t.container.padding.lg}; }
  @media (min-width: ${t.breakpoint.xl}) { padding-inline: ${t.container.padding.xl}; }
`;

export function Container(props: HTMLAttributes<HTMLDivElement>) {
  return <Root {...props} />;
}
