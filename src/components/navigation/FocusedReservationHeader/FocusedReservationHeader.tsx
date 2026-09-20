import { ArrowLeft, CircleHelp, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import styled, { css } from 'styled-components';
import { Button } from '../../../design-system/components/Button';
import { Container } from '../../../design-system/components/Container';
import { IconButton } from '../../../design-system/components/IconButton';
import { designTokens as t } from '../../../design-system/tokens/designTokens';
import { BrandMark } from '../StorefrontHeader/BrandLogo';

export type ReservationHelpAction =
  | { kind: 'link'; to: string }
  | { kind: 'button'; onActivate(): void };

export interface FocusedReservationHeaderProps {
  onBack(): void;
  onExit(): void;
  helpAction?: ReservationHelpAction;
}

const Shell = styled.header`
  position: sticky;
  inset-block-start: 0;
  z-index: var(--layer-sticky);
  padding-block-start: env(safe-area-inset-top);
  background: ${t.color.bg.surface};
  border-block-end: 1px solid ${t.color.border.subtle};
  font-family: ${t.font.family.ui};

  @media (min-width: ${t.breakpoint.lg}) {
    padding-block-start: 0;
  }
`;

const Row = styled(Container)`
  block-size: 60px;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding-inline: ${t.container.padding.mobile};

  @media (min-width: ${t.breakpoint.md}) {
    padding-inline: ${t.container.padding.md};
  }

  @media (min-width: ${t.breakpoint.lg}) {
    block-size: 72px;
    padding-inline: ${t.container.padding.lg};
  }

  @media (min-width: ${t.breakpoint.xl}) {
    padding-inline: ${t.container.padding.xl};
  }
`;

const Left = styled.div`justify-self: start; min-inline-size: 0;`;
const Centre = styled.div`justify-self: center;`;
const Right = styled.div`
  justify-self: end;
  display: flex;
  align-items: center;
  gap: ${t.space[1]};
`;

const PhoneOnly = styled.span`
  display: inline-flex;
  @media (min-width: ${t.breakpoint.md}) { display: none; }
`;
const TabletOnly = styled.span`
  display: none;
  @media (min-width: ${t.breakpoint.md}) { display: inline-flex; }
  @media (min-width: ${t.breakpoint.lg}) { display: none; }
`;
const DesktopOnly = styled.span`
  display: none;
  @media (min-width: ${t.breakpoint.lg}) { display: inline-flex; }
`;

const ghostLink = css`
  block-size: ${t.control.height.compact};
  padding-inline: ${t.space[4]};
  border-radius: ${t.radius[2]};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${t.space[2]};
  color: ${t.color.action.ghost.fg};
  background: ${t.color.action.ghost.bg};
  font-size: ${t.type.button.size};
  line-height: ${t.type.button.lineHeight};
  font-weight: ${t.type.button.weight};
  letter-spacing: ${t.type.button.letterSpacing};
  text-decoration: none;
  &:hover { background: ${t.color.action.ghost.bgHover}; }
  &:active { background: ${t.color.action.ghost.bgActive}; transform: translateY(1px); }
  &:focus-visible { outline: ${t.focus.ring.width} solid ${t.color.focus.ring}; outline-offset: ${t.focus.ring.offset}; }
  svg { inline-size: ${t.icon.size.md}; block-size: ${t.icon.size.md}; stroke-width: ${t.icon.strokeWidth}; }
`;
const HelpLink = styled(Link)`${ghostLink}`;

const HelpIconLink = styled(Link)`
  inline-size: ${t.control.height.compact};
  block-size: ${t.control.height.compact};
  flex: 0 0 auto;
  border-radius: ${t.radius[2]};
  display: inline-grid;
  place-items: center;
  color: ${t.color.action.ghost.fg};
  background: ${t.color.action.ghost.bg};
  text-decoration: none;
  &:hover { background: ${t.color.action.ghost.bgHover}; }
  &:active { background: ${t.color.action.ghost.bgActive}; transform: translateY(1px); }
  &:focus-visible { outline: ${t.focus.ring.width} solid ${t.color.focus.ring}; outline-offset: ${t.focus.ring.offset}; }
  svg { inline-size: ${t.icon.size.md}; block-size: ${t.icon.size.md}; stroke-width: ${t.icon.strokeWidth}; }
`;
const HelpButton = styled.button`
  ${ghostLink}
  border: 0;
  cursor: pointer;
  font-family: inherit;
`;

function HelpControl({ action, compact = false }: { action: ReservationHelpAction; compact?: boolean }) {
  const content: ReactNode = compact
    ? <CircleHelp aria-hidden="true" />
    : <><CircleHelp aria-hidden="true" /> Nápověda</>;
  const label = compact ? 'Nápověda' : undefined;

  if (action.kind === 'link') {
    return compact
      ? <HelpIconLink to={action.to} aria-label="Nápověda"><CircleHelp aria-hidden="true" /></HelpIconLink>
      : <HelpLink to={action.to}>{content}</HelpLink>;
  }

  return compact
    ? <IconButton aria-label="Nápověda" icon={<CircleHelp aria-hidden="true" />} variant="ghost" onClick={action.onActivate} />
    : <HelpButton type="button" aria-label={label} onClick={action.onActivate}>{content}</HelpButton>;
}

export function FocusedReservationHeader({ onBack, onExit, helpAction }: FocusedReservationHeaderProps) {
  return (
    <Shell>
      <Row>
        <Left>
          <PhoneOnly><IconButton aria-label="Zpět" icon={<ArrowLeft aria-hidden="true" />} variant="ghost" onClick={onBack} /></PhoneOnly>
          <TabletOnly><IconButton aria-label="Zpět" icon={<ArrowLeft aria-hidden="true" />} variant="ghost" onClick={onBack} /></TabletOnly>
          <DesktopOnly><Button size="compact" variant="ghost" startIcon={<ArrowLeft aria-hidden="true" />} onClick={onBack}>Zpět</Button></DesktopOnly>
        </Left>

        <Centre><BrandMark /></Centre>

        <Right>
          <TabletOnly>{helpAction ? <HelpControl action={helpAction} compact /> : null}</TabletOnly>
          <DesktopOnly>{helpAction ? <HelpControl action={helpAction} /> : null}</DesktopOnly>
          <PhoneOnly><IconButton aria-label="Ukončit rezervaci" icon={<X aria-hidden="true" />} variant="ghost" onClick={onExit} /></PhoneOnly>
          <TabletOnly><IconButton aria-label="Ukončit rezervaci" icon={<X aria-hidden="true" />} variant="ghost" onClick={onExit} /></TabletOnly>
          <DesktopOnly><Button size="compact" variant="ghost" startIcon={<X aria-hidden="true" />} onClick={onExit}>Ukončit</Button></DesktopOnly>
        </Right>
      </Row>
    </Shell>
  );
}
