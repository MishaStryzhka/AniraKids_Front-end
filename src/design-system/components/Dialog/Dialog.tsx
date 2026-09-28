import {useEffect, useId, useLayoutEffect, useRef, type ReactNode, type RefObject} from 'react';
import {createPortal} from 'react-dom';
import styled from 'styled-components';
import {designTokens as t} from '../../tokens/designTokens';

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: ${t.layer.modal};
  display: grid;
  place-items: center;
  padding: max(${t.space[4]}, env(safe-area-inset-top)) max(${t.space[4]}, env(safe-area-inset-right)) max(${t.space[4]}, env(safe-area-inset-bottom)) max(${t.space[4]}, env(safe-area-inset-left));
  background: rgb(41 37 34 / 42%);
  overflow: hidden;
`;
const Panel = styled.div`
  inline-size: min(100%, 520px);
  max-block-size: calc(100vh - 32px);
  max-block-size: calc(100dvh - 32px);
  min-block-size: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: ${t.space[6]};
  box-sizing: border-box;
  border-radius: ${t.radius[3]};
  background: ${t.color.bg.surface};
  box-shadow: ${t.shadow.overlay};
  color: ${t.color.text.primary};
`;
const Title = styled.h2`
  margin: 0 0 ${t.space[3]};
  font-size: 24px;
  line-height: 32px;
`;
const Description = styled.p`
  margin: 0 0 ${t.space[6]};
  color: ${t.color.text.secondary};
`;

export interface DialogProps {
  open: boolean;
  title: string;
  description?: string;
  onEscape(): void;
  initialFocusRef?: RefObject<HTMLElement>;
  resolveRestoreFocus?(previous: HTMLElement | null): HTMLElement | null;
  children: ReactNode;
}

function eligible(element: HTMLElement | null | undefined, programmatic = false): element is HTMLElement {
  if (!element?.isConnected || element.matches(':disabled,[aria-disabled="true"]') ||
      element.closest('[inert],[hidden],[aria-hidden="true"]') || (!programmatic && element.tabIndex < 0)) return false;
  for (let current: HTMLElement | null = element; current; current = current.parentElement) {
    const style = window.getComputedStyle(current);
    if (style.display === 'none' || style.visibility === 'hidden') return false;
  }
  return true;
}

function preserveStyle(style: CSSStyleDeclaration, property: string) {
  const value = style.getPropertyValue(property);
  const priority = style.getPropertyPriority(property);
  return () => {
    if (value) style.setProperty(property, value, priority);
    else style.removeProperty(property);
  };
}

export function Dialog({open, title, description, onEscape, initialFocusRef, resolveRestoreFocus, children}: DialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const latest = useRef({open, onEscape, initialFocusRef, resolveRestoreFocus});
  latest.current = {open, onEscape, initialFocusRef, resolveRestoreFocus};
  const lifetime = useRef({mounted: false, revision: 0});

  useLayoutEffect(() => {
    const state = lifetime.current;
    state.mounted = true;
    return () => {
      state.mounted = false;
      state.revision += 1;
    };
  }, []);

  // Callback/ref identity updates do not tear down the same visible modal.
  useEffect(() => {
    if (!open) return;
    const state = lifetime.current;
    state.revision += 1;
    const previous = document.activeElement as HTMLElement | null;
    const root = document.getElementById('root');
    const rootInert = root?.getAttribute('inert');
    const rootAria = root?.getAttribute('aria-hidden');
    const restoreBodyOverflow = preserveStyle(document.body.style, 'overflow');
    const restoreHtmlOverflow = preserveStyle(document.documentElement.style, 'overflow');
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    root?.setAttribute('inert', '');
    root?.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    const focusables = () => Array.from(panelRef.current?.querySelectorAll<HTMLElement>(
      'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])',
    ) ?? []).filter(element => eligible(element));
    const initial = latest.current.initialFocusRef?.current;
    (eligible(initial) ? initial : focusables()[0])?.focus();

    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        latest.current.onEscape();
        return;
      }
      if (event.key !== 'Tab') return;
      const list = focusables();
      if (!list.length) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', key);

    return () => {
      const closeRevision = ++state.revision;
      document.removeEventListener('keydown', key);
      if (root) {
        if (rootInert == null) root.removeAttribute('inert');
        else root.setAttribute('inert', rootInert);
        if (rootAria == null) root.removeAttribute('aria-hidden');
        else root.setAttribute('aria-hidden', rootAria);
      }
      restoreBodyOverflow();
      restoreHtmlOverflow();
      if (!/jsdom/i.test(window.navigator.userAgent)) window.scrollTo(scrollX, scrollY);

      // Resolve against the committed, accessible DOM, once. An obsolete close must
      // never consume the page's next intent or focus behind a replacement dialog.
      requestAnimationFrame(() => {
        if (!state.mounted || state.revision !== closeRevision || latest.current.open ||
            document.querySelector('[role="dialog"][aria-modal="true"]')) return;
        const resolve = latest.current.resolveRestoreFocus;
        const target = resolve ? resolve(previous) : previous;
        if (eligible(target, true)) target.focus({preventScroll: true});
      });
    };
  }, [open]);

  if (!open) return null;
  return createPortal(
    <Backdrop>
      <Panel ref={panelRef} role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={description ? descriptionId : undefined}>
        <Title id={titleId}>{title}</Title>
        {description ? <Description id={descriptionId}>{description}</Description> : null}
        {children}
      </Panel>
    </Backdrop>,
    document.body,
  );
}
