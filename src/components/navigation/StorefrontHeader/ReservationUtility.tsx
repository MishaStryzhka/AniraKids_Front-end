import { CalendarDays } from 'lucide-react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { designTokens as t } from '../../../design-system/tokens/designTokens';
import { routes } from '../../../navigation/routes';

const BaseLink = styled(Link)`
  position: relative;
  min-block-size: ${t.control.height.compact};
  border: 1px solid transparent;
  border-radius: ${t.radius[2]};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: ${t.color.action.ghost.fg};
  background: ${t.color.action.ghost.bg};
  text-decoration: none;
  font-family: ${t.font.family.ui};
  transition: background-color ${t.motion.fast} ease, color ${t.motion.fast} ease, transform ${t.motion.fast} ease;

  &:hover { background: ${t.color.action.ghost.bgHover}; }
  &:active { background: ${t.color.action.ghost.bgActive}; transform: translateY(1px); }
  &:focus-visible { outline: ${t.focus.ring.width} solid ${t.color.focus.ring}; outline-offset: ${t.focus.ring.offset}; }
`;
const DesktopLink = styled(BaseLink)`
  block-size: ${t.control.height.compact};
  padding-inline: ${t.space[4]};
  gap: ${t.space[2]};
  font-size: ${t.type.button.size};
  line-height: ${t.type.button.lineHeight};
  font-weight: ${t.type.button.weight};
  letter-spacing: ${t.type.button.letterSpacing};
`;
const CollapsedLink = styled(BaseLink)`
  inline-size: ${t.control.height.compact};
  block-size: ${t.control.height.compact};
  padding: 0;
`;
const IconWrap = styled.span`
  position: relative;
  display: inline-grid;
  place-items: center;
  inline-size: ${t.icon.size.md};
  block-size: ${t.icon.size.md};
  & > svg { inline-size: ${t.icon.size.md}; block-size: ${t.icon.size.md}; stroke-width: ${t.icon.strokeWidth}; }
`;
const Marker = styled.span`
  position: absolute;
  inline-size: 8px;
  block-size: 8px;
  border-radius: ${t.radius.full};
  background: ${t.color.action.primary.bg};
  inset-block-start: -3px;
  inset-inline-end: -4px;
`;

export function ReservationUtility({ hasActiveDraft, presentation }: { hasActiveDraft: boolean; presentation: 'desktop' | 'collapsed' }) {
  const label = hasActiveDraft ? 'Rezervace — máte rozpracovanou rezervaci.' : 'Rezervace';
  const content = (
    <>
      <IconWrap>
        <CalendarDays aria-hidden="true" />
        {hasActiveDraft ? <Marker aria-hidden="true" /> : null}
      </IconWrap>
      {presentation === 'desktop' ? <span>Rezervace</span> : null}
    </>
  );

  return presentation === 'desktop' ? (
    <DesktopLink to={routes.reservation} aria-label={label}>{content}</DesktopLink>
  ) : (
    <CollapsedLink to={routes.reservation} aria-label={label}>{content}</CollapsedLink>
  );
}
