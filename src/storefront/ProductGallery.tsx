import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { flushSync } from 'react-dom';
import { ChevronLeft, ChevronRight, Expand, ImageOff, X } from 'lucide-react';
import styled from 'styled-components';
import { Dialog } from '../design-system/components/Dialog';
import { IconButton } from '../design-system/components/IconButton';
import { designTokens as t } from '../design-system/tokens/designTokens';
import type { ProductCard } from './api/publicApi';

type GalleryProduct = Pick<ProductCard, 'name' | 'photos'>;
type Photo = ProductCard['photos'][number];

const Root = styled.section`
  min-inline-size: 0;
  display: grid;
  align-content: start;
  gap: ${t.space[3]};
`;
const Stage = styled.div`
  position: relative;
  min-inline-size: 0;
  aspect-ratio: 3 / 4;
  overflow: hidden;
  border: 1px solid ${t.color.border.subtle};
  border-radius: ${t.radius[3]};
  background: ${t.color.bg.canvas};
`;
const OpenPhoto = styled.button`
  display: block;
  inline-size: 100%;
  block-size: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  cursor: zoom-in;
  touch-action: pan-y pinch-zoom;
  &:focus-visible { outline: 2px solid ${t.color.focus.ring}; outline-offset: -4px; }
`;
const PhotoImage = styled.img`
  display: block;
  inline-size: 100%;
  block-size: 100%;
  object-fit: contain;
  user-select: none;
`;
const MissingPhoto = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${t.space[3]};
  inline-size: 100%;
  block-size: 100%;
  padding: ${t.space[3]};
  color: ${t.color.text.muted};
  background: ${t.color.bg.subtle};
  font: ${t.type.bodySm.size}/${t.type.bodySm.lineHeight} ${t.font.family.ui};
  text-align: center;
`;
const Control = styled(IconButton)`
  border-radius: ${t.radius.full};
  border-color: ${t.color.border.subtle};
  background: rgb(250 248 246 / 88%);
  box-shadow: ${t.shadow.sm};
  &:hover:not(:disabled) { background: ${t.color.bg.surface}; }
`;
const Arrow = styled.div<{ $side: 'left' | 'right' }>`
  position: absolute;
  inset-block-start: 50%;
  ${({ $side }) => $side}: ${t.space[2]};
  transform: translateY(-50%);
`;
const Count = styled.span`
  position: absolute;
  inset-inline-start: ${t.space[3]};
  inset-block-end: ${t.space[3]};
  padding: 6px ${t.space[3]};
  border-radius: ${t.radius.full};
  background: rgb(250 248 246 / 88%);
  color: ${t.color.text.brand};
  font: ${t.type.caption.size}/${t.type.caption.lineHeight} ${t.font.family.ui};
  font-variant-numeric: tabular-nums;
  pointer-events: none;
`;
const ZoomHint = styled.span`
  position: absolute;
  inset-inline-end: ${t.space[3]};
  inset-block-end: ${t.space[3]};
  display: grid;
  place-items: center;
  inline-size: 36px;
  block-size: 36px;
  border-radius: ${t.radius.full};
  background: rgb(250 248 246 / 88%);
  color: ${t.color.text.brand};
  box-shadow: ${t.shadow.sm};
  pointer-events: none;
`;
const Rail = styled.div`
  position: relative;
  display: flex;
  gap: ${t.space[2]};
  overflow-x: auto;
  overscroll-behavior-inline: contain;
  padding: ${t.space[1]} 2px;
  scrollbar-width: thin;
  scrollbar-color: ${t.color.border.subtle} transparent;
`;
const Thumbnail = styled.button`
  flex: 0 0 64px;
  inline-size: 64px;
  aspect-ratio: 3 / 4;
  padding: 3px;
  border: 1px solid ${t.color.border.subtle};
  border-radius: ${t.radius[2]};
  background: ${t.color.bg.surface};
  overflow: hidden;
  cursor: pointer;
  transition: border-color ${t.motion.fast} ease, box-shadow ${t.motion.fast} ease;
  img { object-fit: cover; border-radius: ${t.radius[1]}; }
  &[aria-pressed='true'] { border-color: ${t.color.action.primary.bg}; box-shadow: 0 0 0 1px ${t.color.action.primary.bg}; }
  &:hover { border-color: ${t.color.action.primary.bg}; }
  &:focus-visible { outline: 2px solid ${t.color.focus.ring}; outline-offset: 2px; }
  @media (min-width: ${t.breakpoint.md}) { flex-basis: 72px; inline-size: 72px; }
`;
const Lightbox = styled(Dialog)`
  position: relative;
  inline-size: min(1100px, 100%);
  padding: ${t.space[4]};
  background: ${t.color.bg.canvas};
  font-family: ${t.font.family.ui};
  > h2 {
    padding-inline-end: 52px;
    margin-block-end: ${t.space[4]};
    font-family: ${t.font.family.editorial};
    font-size: 22px;
    line-height: 28px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;
const Close = styled(Control)`
  position: absolute;
  inset-block-start: ${t.space[2]};
  inset-inline-end: ${t.space[2]};
`;
const LightboxContent = styled.div`
  display: grid;
  gap: ${t.space[3]};
  min-inline-size: 0;
  @media (max-height: 480px) { ${Rail} { display: none; } }
`;
const LargeStage = styled(Stage)`
  aspect-ratio: auto;
  block-size: clamp(120px, calc(100vh - 250px), 760px);
  block-size: clamp(120px, calc(100dvh - 250px), 760px);
  touch-action: pan-y pinch-zoom;
  @media (max-height: 480px) {
    block-size: max(120px, calc(100vh - 150px));
    block-size: max(120px, calc(100dvh - 150px));
  }
`;

function GalleryPhoto({ photo, alt, thumbnail = false }: { photo?: Photo; alt: string; thumbnail?: boolean }) {
  const [failed, setFailed] = useState(false);
  return photo?.url && !failed ? <PhotoImage src={photo.url} alt={alt} draggable={false}
    loading={thumbnail ? 'lazy' : 'eager'} decoding="async" onError={() => setFailed(true)} /> :
    <MissingPhoto role={thumbnail ? undefined : 'img'} aria-label={thumbnail ? undefined : alt} aria-hidden={thumbnail || undefined}>
      <ImageOff size={thumbnail ? 20 : 32} aria-hidden="true" />
      {!thumbnail ? <span>Fotografie není k dispozici.</span> : null}
    </MissingPhoto>;
}

function Thumbnails({ photos, selected, onSelect }: { photos: Photo[]; selected: number; onSelect(index: number): void }) {
  const railRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const rail = railRef.current;
    const button = rail?.children[selected] as HTMLElement | undefined;
    if (!rail || !button) return;
    const left = button.offsetLeft;
    const right = left + button.offsetWidth;
    if (left < rail.scrollLeft || right > rail.scrollLeft + rail.clientWidth) {
      rail.scrollTo({ left: Math.max(0, left - (rail.clientWidth - button.offsetWidth) / 2) });
    }
  }, [selected]);
  if (photos.length < 2) return null;
  return <Rail ref={railRef} role="group" aria-label="Náhledy fotografií">
    {photos.map((photo, index) => <Thumbnail key={`${photo.url}-${index}`} type="button"
      aria-label={`Zobrazit fotografii ${index + 1} ze ${photos.length}`} aria-pressed={selected === index}
      onClick={() => onSelect(index)}><GalleryPhoto photo={photo} alt="" thumbnail /></Thumbnail>)}
  </Rail>;
}

export function ProductGallery({ product }: { product: GalleryProduct }) {
  const [selected, setSelected] = useState(0);
  const [expanded, setExpanded] = useState(false);
  useEffect(() => {
    if (!expanded) return;
    // Release the dialog's saved scroll position before the router restores a history entry.
    const beforeHistoryNavigation = () => flushSync(() => setExpanded(false));
    window.addEventListener('popstate', beforeHistoryNavigation, true);
    return () => window.removeEventListener('popstate', beforeHistoryNavigation, true);
  }, [expanded]);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);
  const photos = product.photos;
  const index = Math.min(selected, Math.max(0, photos.length - 1));
  const current = photos[index];
  const alt = current?.alt || `${product.name} – fotografie ${index + 1}`;
  const move = (direction: number) => setSelected(value => photos.length ? (Math.min(value, photos.length - 1) + direction + photos.length) % photos.length : 0);
  const handleKeys = (event: KeyboardEvent<HTMLElement>) => {
    if (photos.length < 2 || event.altKey || event.ctrlKey || event.metaKey || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    event.stopPropagation();
    move(event.key === 'ArrowRight' ? 1 : -1);
  };
  const swipe = {
    onPointerDown: (event: PointerEvent<HTMLElement>) => {
      swiped.current = false;
      pointerStart.current = event.isPrimary && event.pointerType !== 'mouse' ? { x: event.clientX, y: event.clientY } : null;
    },
    onPointerCancel: () => { pointerStart.current = null; },
    onPointerUp: (event: PointerEvent<HTMLElement>) => {
      const start = pointerStart.current;
      pointerStart.current = null;
      if (!start || photos.length < 2) return;
      const dx = event.clientX - start.x, dy = event.clientY - start.y;
      if (Math.abs(dx) >= 48 && Math.abs(dx) > Math.abs(dy) * 1.5) { swiped.current = true; move(dx < 0 ? 1 : -1); }
    },
  };
  const controls = <>
    {photos.length > 1 ? <>
      <Arrow $side="left"><Control aria-label="Předchozí fotografie" icon={<ChevronLeft aria-hidden="true" />} onClick={() => move(-1)} /></Arrow>
      <Arrow $side="right"><Control aria-label="Další fotografie" icon={<ChevronRight aria-hidden="true" />} onClick={() => move(1)} /></Arrow>
    </> : null}
    {photos.length ? <Count role="status" aria-live="polite" aria-atomic="true" aria-label={`Fotografie ${index + 1} ze ${photos.length}`}>{index + 1} / {photos.length}</Count> : null}
  </>;
  return <Root aria-label={`Fotografie: ${product.name}`} onKeyDown={handleKeys}>
    <Stage>
      {photos.length ? <OpenPhoto type="button" aria-haspopup="dialog" aria-label={`Zvětšit fotografii ${index + 1}: ${product.name}`}
        {...swipe} onClick={() => { if (swiped.current) { swiped.current = false; return; } setExpanded(true); }}>
        <GalleryPhoto key={current?.url} photo={current} alt={alt} />
        <ZoomHint aria-hidden="true"><Expand size={18} /></ZoomHint>
      </OpenPhoto> : <GalleryPhoto alt={`${product.name} – fotografie není k dispozici`} />}
      {controls}
    </Stage>
    <Thumbnails photos={photos} selected={index} onSelect={setSelected} />
    <Lightbox open={expanded} title={`Fotografie: ${product.name}`} onEscape={() => setExpanded(false)} dismissOnBackdrop>
      <LightboxContent onKeyDown={handleKeys}>
        <Close aria-label="Zavřít galerii" icon={<X aria-hidden="true" />} onClick={() => setExpanded(false)} />
        <LargeStage {...swipe}>
          <GalleryPhoto key={current?.url} photo={current} alt={alt} />
          {controls}
        </LargeStage>
        <Thumbnails photos={photos} selected={index} onSelect={setSelected} />
      </LightboxContent>
    </Lightbox>
  </Root>;
}
