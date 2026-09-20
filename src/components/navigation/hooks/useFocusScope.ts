import { useEffect } from 'react';

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function isFocusable(element: HTMLElement) {
  if (element.closest('[inert]')) return false;
  if (element.getAttribute('aria-hidden') === 'true') return false;
  return element.getClientRects().length > 0;
}

function collectFocusable(containers: HTMLElement[]) {
  const elements: HTMLElement[] = [];
  containers.forEach(container => {
    if (container.matches(FOCUSABLE) && isFocusable(container)) elements.push(container);
    container.querySelectorAll<HTMLElement>(FOCUSABLE).forEach(element => {
      if (isFocusable(element)) elements.push(element);
    });
  });
  return Array.from(new Set(elements));
}

interface FocusScopeOptions {
  active: boolean;
  getContainers: () => HTMLElement[];
  getInitialFocus?: () => HTMLElement | null;
  onEscape?: () => void;
}

export function useFocusScope({ active, getContainers, getInitialFocus, onEscape }: FocusScopeOptions) {
  useEffect(() => {
    if (!active) return;

    const focusInitial = () => {
      const initial = getInitialFocus?.() ?? collectFocusable(getContainers())[0] ?? null;
      initial?.focus({ preventScroll: true });
    };
    const frame = window.requestAnimationFrame(focusInitial);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onEscape?.();
        return;
      }
      if (event.key !== 'Tab') return;

      const focusable = collectFocusable(getContainers());
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const activeElement = document.activeElement as HTMLElement | null;
      const currentIndex = activeElement ? focusable.indexOf(activeElement) : -1;
      let nextIndex = currentIndex;

      if (event.shiftKey) {
        nextIndex = currentIndex <= 0 ? focusable.length - 1 : currentIndex - 1;
      } else {
        nextIndex = currentIndex < 0 || currentIndex === focusable.length - 1 ? 0 : currentIndex + 1;
      }

      event.preventDefault();
      focusable[nextIndex]?.focus();
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [active, getContainers, getInitialFocus, onEscape]);
}
