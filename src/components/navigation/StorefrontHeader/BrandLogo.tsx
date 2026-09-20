import { Link } from 'react-router-dom';
import styled from 'styled-components';
import IconLogo from '../../../images/icons/Icon';
import { designTokens as t } from '../../../design-system/tokens/designTokens';
import { routes } from '../../../navigation/routes';

const LogoLink = styled(Link)`
  min-inline-size: ${t.control.height.compact};
  min-block-size: ${t.control.height.compact};
  display: inline-grid;
  place-items: center;
  color: ${t.color.text.primary};
  border-radius: ${t.radius[1]};
  text-decoration: none;

  &:focus-visible {
    outline: ${t.focus.ring.width} solid ${t.color.focus.ring};
    outline-offset: ${t.focus.ring.offset};
  }
`;

const Mark = styled(IconLogo)`
  display: block;
  block-size: 24px;
  inline-size: auto;
  max-inline-size: ${t.space[30]};
  color: ${t.color.text.primary};
`;

export function BrandMark({ className }: { className?: string }) {
  return <Mark className={className} fill="currentColor" aria-hidden="true" focusable="false" />;
}

export function BrandLogo({ className }: { className?: string }) {
  return (
    <LogoLink className={className} to={routes.home} aria-label="AniraKids — domů" data-brand-logo>
      <BrandMark />
    </LogoLink>
  );
}
