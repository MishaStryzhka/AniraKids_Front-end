import { useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/** Shared by all routes, including navigation through the fixed mobile menu. */
export function RouteScrollRestoration() {
  const { key, hash } = useLocation();
  const navigationType = useNavigationType();
  const positions = useRef(new Map<string, number>());
  const current = useRef({ key, y: window.scrollY });
  const restoring = useRef(false);

  useLayoutEffect(() => {
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    const remember = () => {
      // A fixed overlay moves the window to zero without moving the underlying page.
      if (!restoring.current && document.body.style.position !== 'fixed') {
        current.current.y = window.scrollY;
      }
    };
    window.addEventListener('scroll', remember, { passive: true });
    return () => {
      window.removeEventListener('scroll', remember);
      window.history.scrollRestoration = previous;
    };
  }, []);

  useLayoutEffect(() => {
    const changed = current.current.key !== key;
    if (changed) {
      positions.current.set(current.current.key, current.current.y);
      if (positions.current.size > 100) {
        positions.current.delete(positions.current.keys().next().value);
      }
    }
    const savedY = navigationType === 'POP' ? positions.current.get(key) : undefined;
    current.current = { key, y: savedY ?? window.scrollY };
    // Leave the browser's initial/reload position alone unless following an anchor.
    if (!changed && !hash) return;

    let anchor = '';
    try { anchor = decodeURIComponent(hash.slice(1)); } catch { /* Invalid hash: use page top. */ }
    let observer: ResizeObserver | undefined;
    let timer: number | undefined;
    const cleanup = () => {
      observer?.disconnect();
      window.clearTimeout(timer);
      restoring.current = false;
      window.removeEventListener('wheel', stop);
      window.removeEventListener('touchstart', stop);
      window.removeEventListener('pointerdown', stop);
      window.removeEventListener('keydown', stop);
    };
    const stop = () => {
      current.current.y = window.scrollY;
      cleanup();
    };
    const restore = () => {
      const element = savedY === undefined && anchor ? document.getElementById(anchor) : null;
      if (element) {
        element.scrollIntoView();
        stop();
      } else {
        const target = savedY ?? 0;
        window.scrollTo(0, target);
        if (Math.abs(window.scrollY - target) < 1 && (!anchor || savedY !== undefined)) stop();
      }
    };

    restoring.current = true;
    // Account/catalogue content can arrive after the route renders. Retry until
    // the saved position/anchor exists, but never fight the user's next gesture.
    observer = new ResizeObserver(restore);
    observer.observe(document.body);
    for (const event of ['wheel', 'touchstart', 'pointerdown', 'keydown']) {
      window.addEventListener(event, stop, { passive: true });
    }
    timer = window.setTimeout(stop, 5000);
    restore();
    return cleanup;
  }, [key, hash, navigationType]);

  return null;
}
