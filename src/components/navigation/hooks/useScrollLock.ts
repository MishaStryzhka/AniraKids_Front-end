import { useLayoutEffect, useRef } from 'react';

interface BodySnapshot {
  position: string;
  top: string;
  left: string;
  right: string;
  width: string;
  overflow: string;
  paddingRight: string;
}

export function useScrollLock(active: boolean) {
  const scrollYRef = useRef(0);

  useLayoutEffect(() => {
    if (!active) return;

    const body = document.body;
    const snapshot: BodySnapshot = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow,
      paddingRight: body.style.paddingRight,
    };

    const scrollY = window.scrollY;
    scrollYRef.current = scrollY;
    const scrollbarGap = Math.max(0, window.innerWidth - document.documentElement.clientWidth);

    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.left = '0';
    body.style.right = '0';
    body.style.width = '100%';
    body.style.overflow = 'hidden';
    if (scrollbarGap > 0) body.style.paddingRight = `${scrollbarGap}px`;

    return () => {
      body.style.position = snapshot.position;
      body.style.top = snapshot.top;
      body.style.left = snapshot.left;
      body.style.right = snapshot.right;
      body.style.width = snapshot.width;
      body.style.overflow = snapshot.overflow;
      body.style.paddingRight = snapshot.paddingRight;
      window.scrollTo(0, scrollYRef.current);
    };
  }, [active]);
}
