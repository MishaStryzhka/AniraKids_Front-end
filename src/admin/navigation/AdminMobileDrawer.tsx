import { useCallback, useLayoutEffect, useRef, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import styled from 'styled-components';
import { IconButton } from '../../design-system/components/IconButton';
import { designTokens as t } from '../../design-system/tokens/designTokens';
import { useFocusScope } from '../../components/navigation/hooks/useFocusScope';
import { useScrollLock } from '../../components/navigation/hooks/useScrollLock';
import { AdminNavigation } from './AdminNavigation';

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: ${t.layer.navigation};
  background: rgb(41 37 34 / 32%);
`;
const Panel = styled.div`
  inline-size: min(320px, calc(100vw - 48px));
  block-size: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overscroll-behavior: contain;
  background: ${t.color.bg.surface};
  color: ${t.color.text.primary};
  font-family: ${t.font.family.ui};
  box-shadow: ${t.shadow.overlay};
  animation: admin-drawer-enter ${t.motion.normal} ease-out;
  @keyframes admin-drawer-enter { from { transform: translateX(-100%); } to { transform: translateX(0); } }
  @media (prefers-reduced-motion: reduce) { animation: none; }
`;
const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${t.space[3]};
  min-block-size: 60px;
  flex-shrink: 0;
  padding: env(safe-area-inset-top) ${t.space[3]} 0 max(${t.space[4]}, env(safe-area-inset-left));
  border-block-end: 1px solid ${t.color.border.subtle};
`;
const Title = styled.h2`
  margin: 0;
  font: ${t.font.weight.semibold} ${t.type.bodyMd.size}/${t.type.bodyMd.lineHeight} ${t.font.family.ui};
`;
const Links = styled.div`
  padding: ${t.space[4]} ${t.space[4]} max(${t.space[6]}, env(safe-area-inset-bottom)) max(${t.space[4]}, env(safe-area-inset-left));
`;

interface Props {
  backgroundRef: RefObject<HTMLDivElement>;
  onClose(): void;
  onNavigate(): void;
  resolveRestoreFocus(): HTMLElement | null;
}

export function AdminMobileDrawer({ backgroundRef, onClose, onNavigate, resolveRestoreFocus }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const getContainers = useCallback(() => panelRef.current ? [panelRef.current] : [], []);
  const getInitialFocus = useCallback(() => panelRef.current?.querySelector<HTMLButtonElement>('button') ?? null, []);
  useScrollLock(true);
  useFocusScope({ active: true, getContainers, getInitialFocus, onEscape: onClose });

  useLayoutEffect(() => {
    const background = backgroundRef.current;
    const inert = background?.getAttribute('inert');
    const ariaHidden = background?.getAttribute('aria-hidden');
    getInitialFocus()?.focus({ preventScroll: true });
    background?.setAttribute('inert', '');
    background?.setAttribute('aria-hidden', 'true');
    return () => {
      if (background) {
        if (inert == null) background.removeAttribute('inert'); else background.setAttribute('inert', inert);
        if (ariaHidden == null) background.removeAttribute('aria-hidden'); else background.setAttribute('aria-hidden', ariaHidden);
      }
      requestAnimationFrame(() => {
        if (document.querySelector('[role="dialog"][aria-modal="true"]')) return;
        const target = resolveRestoreFocus();
        if (target?.isConnected && target.getClientRects().length && !target.closest('[inert]')) target.focus({ preventScroll: true });
      });
    };
  }, [backgroundRef, getInitialFocus, resolveRestoreFocus]);

  return createPortal(<Backdrop data-admin-nav-backdrop onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <Panel id="admin-mobile-navigation" ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="admin-mobile-navigation-title">
      <Header>
        <Title id="admin-mobile-navigation-title">ANIRAK</Title>
        <IconButton aria-label="Zavřít navigaci administrace" icon={<X aria-hidden="true" />} onClick={onClose}/>
      </Header>
      <Links><AdminNavigation onNavigate={onNavigate}/></Links>
    </Panel>
  </Backdrop>, document.body);
}
