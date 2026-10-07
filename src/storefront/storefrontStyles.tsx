import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { Container } from '../design-system/components/Container';
import { designTokens as t } from '../design-system/tokens/designTokens';
export const Page = styled(Container)`
  padding-block: ${t.space[8]} ${t.space[10]};
  font-family: ${t.font.family.ui};
  color: ${t.color.text.primary};
  display: grid;
  gap: ${t.space[6]};
  min-block-size: 45vh;
  [name],
  [tabindex='-1'] {
    scroll-margin-block-start: 88px;
  }
`;
export const Title = styled.h1`
  margin: 0;
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  line-height: 1.2;
  overflow-wrap: anywhere;
  &:focus {
    outline: 2px solid ${t.color.focus.ring};
    outline-offset: 2px;
  }
`;
export const Heading = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  line-height: 1.4;
  overflow-wrap: anywhere;
`;
export const Copy = styled.p`
  margin: 0;
  line-height: 1.6;
  overflow-wrap: anywhere;
`;
export const Stack = styled.div`
  display: grid;
  gap: ${t.space[4]};
  min-inline-size: 0;
`;
export const Columns = styled(Stack)`
  @media (min-width: 1024px) {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: ${t.space[8]};
    align-items: start;
  }
`;
export const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${t.space[3]};
  @media (max-width: 767px) {
    flex-direction: column;
    > button,
    > a {
      inline-size: 100%;
    }
  }
`;
export const Panel = styled(Stack)`
  padding: ${t.space[6]};
  border: 1px solid ${t.color.border.subtle};
  border-radius: ${t.radius[2]};
  background: ${t.color.bg.surface};
  @media (max-width: 767px) {
    padding: ${t.space[4]};
  }
`;
export const Alert = styled(Panel)`
  &:focus {
    outline: 2px solid ${t.color.focus.ring};
    outline-offset: 2px;
  }
`;
export const ErrorCopy = styled(Copy)`
  color: ${t.color.status.danger.strong};
  font-size: ${t.type.bodySm.size};
`;
export const RouteLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-block-size: 44px;
  padding: ${t.space[2]} ${t.space[4]};
  border: 1px solid ${t.color.action.secondary.border};
  border-radius: ${t.radius[2]};
  background: ${t.color.action.secondary.bg};
  color: ${t.color.action.secondary.fg};
  text-decoration: none;
  font-weight: 600;
  line-height: 1.5;
  &:hover {
    background: ${t.color.action.secondary.bgHover};
  }
  &:focus-visible {
    outline: 2px solid ${t.color.focus.ring};
    outline-offset: 2px;
  }
`;
export const Facts = styled.dl`
  margin: 0;
  display: grid;
  gap: ${t.space[3]};
  > div {
    display: flex;
    justify-content: space-between;
    gap: ${t.space[4]};
  }
  dt,
  dd {
    margin: 0;
    overflow-wrap: anywhere;
  }
  dd {
    text-align: right;
    font-weight: 600;
  }
`;
