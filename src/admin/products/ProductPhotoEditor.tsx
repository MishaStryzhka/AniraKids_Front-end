import {useCallback, useEffect, useId, useRef, useState} from 'react';
import Cropper, {type Area, type Size} from 'react-easy-crop';
import styled from 'styled-components';
import {Button} from '../../design-system/components/Button';
import {Dialog} from '../../design-system/components/Dialog';
import {SelectField} from '../../design-system/components/SelectField';
import {designTokens as t} from '../../design-system/tokens/designTokens';
import {cropProductPhoto, ProductPhotoCropError} from './cropProductPhoto';

const Content = styled.div`display:grid;gap:${t.space[4]};min-inline-size:0;`;
const CropArea = styled.div<{$busy:boolean}>`
  position:relative;inline-size:100%;block-size:clamp(180px, 36dvh, 320px);
  border-radius:${t.radius[2]};background:${t.color.bg.subtle};overflow:hidden;
  pointer-events:${({$busy}) => $busy ? 'none' : 'auto'};
  &:focus-visible{outline:2px solid ${t.color.focus.ring};outline-offset:2px;}
`;
const Hint = styled.p`margin:0;color:${t.color.text.secondary};font-size:${t.type.bodySm.size};line-height:1.5;`;
const Zoom = styled.label`
  display:grid;gap:${t.space[1]};font-size:${t.type.label.size};font-weight:${t.type.label.weight};
  input{inline-size:100%;min-block-size:44px;margin:0;accent-color:${t.color.action.primary.bg};}
  input:focus-visible{outline:2px solid ${t.color.focus.ring};outline-offset:2px;}
`;
const Actions = styled.div`display:grid;grid-template-columns:1fr 1fr;gap:${t.space[3]};`;
const ErrorCopy = styled(Hint)`color:${t.color.status.danger.fg};`;
const ratios:Record<string,number> = {portrait:3/4, square:1, landscape:4/3};

interface ProductPhotoEditorProps {
  open:boolean;
  source:File;
  sourceUrl:string;
  onApply(file:File):void;
  onCancel():void;
}

// Kept mounted while a page-owned leave dialog is visible, so its draft survives "Zůstat".
export function ProductPhotoEditor({open, source, sourceUrl, onApply, onCancel}:ProductPhotoEditorProps) {
  const [crop, setCrop] = useState({x:0, y:0});
  const [zoom, setZoom] = useState(1);
  const [ratio, setRatio] = useState('original');
  const [originalRatio, setOriginalRatio] = useState(1);
  const [pixels, setPixels] = useState<Area|null>(null);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const saving = useRef(false);
  const alive = useRef(true);
  const contentRef = useRef<HTMLDivElement>(null);
  const cropRef = useRef<HTMLDivElement>(null);
  const mediaSize = useRef<Size>({width:0,height:0});
  const cropSize = useRef<Size>({width:0,height:0});
  const hintId = useId();
  useEffect(() => {alive.current = true; return () => {alive.current = false;};}, []);
  useEffect(() => {if (open && busy) contentRef.current?.focus();}, [open, busy]);
  const onAreaChange = useCallback((_:Area, next:Area) => setPixels(next), []);
  const cancel = () => {if (!saving.current) onCancel();};
  const save = async () => {
    if (saving.current || !loaded || !pixels) return;
    saving.current = true;
    setBusy(true);
    setError('');
    try {
      const result = await cropProductPhoto(sourceUrl, source, pixels);
      if (alive.current) onApply(result);
    } catch (failure) {
      if (alive.current) setError(failure instanceof ProductPhotoCropError ? failure.message : 'Fotografii se nepodařilo zpracovat. Zkuste to prosím znovu.');
    } finally {
      saving.current = false;
      if (alive.current) setBusy(false);
    }
  };

  return <Dialog open={open} title="Upravit fotografii" onEscape={cancel} initialFocusRef={cropRef}>
    <Content ref={contentRef} tabIndex={-1} data-product-photo-editor onKeyDown={event => {
      if (busy && event.key === 'Tab') event.preventDefault();
    }}>
      <Hint id={hintId}>Posuňte fotografii tažením nebo šipkami. Poměr stran a přiblížení upravte níže.</Hint>
      <CropArea ref={cropRef} role="group" aria-label="Výřez fotografie" aria-describedby={hintId}
        tabIndex={busy ? -1 : 0} aria-disabled={busy || undefined} $busy={busy} onKeyDown={event => {
          if (busy) return;
          const moves:Record<string,{x:number;y:number}> = {ArrowLeft:{x:-10,y:0},ArrowRight:{x:10,y:0},ArrowUp:{x:0,y:-10},ArrowDown:{x:0,y:10}};
          const move = moves[event.key];
          if (move) {
            event.preventDefault();
            const maxX = Math.max(0,(mediaSize.current.width*zoom-cropSize.current.width)/2);
            const maxY = Math.max(0,(mediaSize.current.height*zoom-cropSize.current.height)/2);
            setCrop(current => ({x:Math.max(-maxX,Math.min(maxX,current.x+move.x)),y:Math.max(-maxY,Math.min(maxY,current.y+move.y))}));
          }
        }}>
        <Cropper image={sourceUrl} crop={crop} zoom={zoom} maxZoom={4}
          aspect={ratio === 'original' ? originalRatio : ratios[ratio]} cropShape="rect" objectFit="contain"
          zoomWithScroll={false} onCropChange={busy ? () => {} : setCrop} onZoomChange={busy ? () => {} : setZoom}
          setMediaSize={size => {mediaSize.current = size;}} setCropSize={size => {cropSize.current = size;}}
          onCropAreaChange={onAreaChange} onMediaLoaded={media => {setOriginalRatio(media.naturalWidth/media.naturalHeight);setLoaded(true);}}
          mediaProps={{alt:'Fotografie k oříznutí', onError:() => {setLoaded(false);setPixels(null);setError('Fotografii nelze načíst. Vyberte prosím jiný obrázek.');}}}/>
      </CropArea>
      <SelectField label="Poměr stran" value={ratio} disabled={busy || !loaded} onChange={event => {
        setRatio(event.target.value);setCrop({x:0,y:0});setZoom(1);setPixels(null);
      }}>
        <option value="original">Původní</option><option value="portrait">Na výšku (3:4)</option>
        <option value="square">Čtverec (1:1)</option><option value="landscape">Na šířku (4:3)</option>
      </SelectField>
      <Zoom>Přiblížení<input type="range" min={1} max={4} step={0.01} value={zoom} disabled={busy || !loaded}
        onChange={event => setZoom(Number(event.target.value))}/></Zoom>
      {error ? <ErrorCopy role="alert">{error}</ErrorCopy> : null}
      <Actions><Button variant="secondary" disabled={busy} onClick={cancel}>Zrušit</Button>
        <Button disabled={busy || !loaded || !pixels} loading={busy} onClick={save}>{busy ? 'Ukládání…' : 'Uložit'}</Button></Actions>
    </Content>
  </Dialog>;
}
