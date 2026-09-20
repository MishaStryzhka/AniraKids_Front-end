import type { RefObject } from 'react';
import { useEffect } from 'react';

type InertHTMLElement = HTMLElement & { inert: boolean };

export function setInert(element: HTMLElement | null, inert: boolean) {
  if (!element) return;
  (element as InertHTMLElement).inert = inert;
  if (inert) element.setAttribute('inert', '');
  else element.removeAttribute('inert');
}

export function useInert(refs: Array<RefObject<HTMLElement>>, active: boolean) {
  useEffect(() => {
    refs.forEach(ref => setInert(ref.current, active));
    return () => refs.forEach(ref => setInert(ref.current, false));
  }, [active, refs]);
}
