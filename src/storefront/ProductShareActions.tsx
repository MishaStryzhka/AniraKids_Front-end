import {useEffect, useState} from 'react';
import {QrCode, Share2, X} from 'lucide-react';
import styled from 'styled-components';
import {IconButton} from '../design-system/components/IconButton';
import {Button} from '../design-system/components/Button';
import {Dialog} from '../design-system/components/Dialog';
import {designTokens as t} from '../design-system/tokens/designTokens';
import {productPath} from '../navigation/routes';
import {FavoriteButton} from './favorites/FavoriteButton';
import {Actions, Copy, Stack} from './storefrontStyles';

const Row = styled.div`display:flex;align-items:center;gap:8px;`;
const ActionIcon = styled(IconButton)`
  background:rgb(250 248 246 / 25%);
  &:hover:not(:disabled){background:rgb(250 248 246 / 60%);}
  & > svg{width:22px;height:22px;stroke-width:1.75;filter:drop-shadow(0 1px 2px rgb(41 37 34 / 18%));}
`;
const ShareDialog = styled(Dialog)`
  position:relative;text-align:center;
  h2{padding:0 36px;font-family:${t.font.family.editorial};}
`;
const Close = styled(IconButton)`position:absolute;right:12px;top:12px;`;
const QrImage = styled.img`display:block;width:min(100%,280px);height:auto;margin:0 auto;background:white;`;
const LinkField = styled.input`box-sizing:border-box;width:100%;padding:12px;border:1px solid ${t.color.border.subtle};border-radius:8px;background:${t.color.bg.canvas};color:${t.color.text.secondary};font:inherit;`;

export function ProductShareActions({id, name, slug}: {id:string; name:string; slug:string}) {
  const url = new URL(productPath(slug), window.location.origin).href;
  const [modal, setModal] = useState<'qr'|'link'|null>(null);
  const [qr, setQr] = useState('');
  const [qrError, setQrError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (modal !== 'qr') return;
    let cancelled = false;
    setQr(''); setQrError(false);
    import('qrcode').then(({default: QRCode}) => QRCode.toDataURL(url, {
      width:560, margin:4, errorCorrectionLevel:'M', color:{dark:'#292522',light:'#ffffff'},
    })).then(value => {if (!cancelled) setQr(value);})
      .catch(() => {if (!cancelled) setQrError(true);});
    return () => {cancelled = true;};
  }, [modal, url, retry]);

  async function copyLink() {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(url);
      setNotice('Odkaz byl zkopírován.');
    } catch {
      setModal(current => current || 'link');
      setNotice('Odkaz zkopírujte z pole níže.');
    }
  }
  async function share() {
    if (busy) return;
    setBusy(true); setNotice('');
    try {
      if (navigator.share) {
        try {await navigator.share({title:name, url}); return;}
        catch (error) {if ((error as {name?:string}).name === 'AbortError') return;}
      }
      await copyLink();
    } finally {setBusy(false);}
  }
  return <>
    <Row>
      <FavoriteButton id={id} name={name}/>
      <ActionIcon aria-label="Sdílet produkt" title="Sdílet" disabled={busy} onClick={share} icon={<Share2 aria-hidden="true"/>}/>
      <ActionIcon aria-label="Zobrazit QR kód produktu" title="QR kód" onClick={() => {setNotice('');setModal('qr');}} icon={<QrCode aria-hidden="true"/>}/>
    </Row>
    {!modal && notice ? <Copy role="status">{notice}</Copy> : null}
    <ShareDialog open={modal !== null} title={modal === 'qr' ? 'QR kód produktu' : 'Sdílet produkt'} onEscape={() => setModal(null)} dismissOnBackdrop>
      <Close aria-label="Zavřít" onClick={() => setModal(null)} icon={<X aria-hidden="true"/>}/>
      <Stack>
        <Copy>{name}</Copy>
        {modal === 'qr' ? qr ? <QrImage src={qr} alt={`QR kód: ${name}`} width={560} height={560}/> : qrError ? <><Copy role="alert">QR kód se nepodařilo vytvořit.</Copy><Button variant="secondary" onClick={() => setRetry(value => value + 1)}>Zkusit znovu</Button></> : <Copy role="status">Vytváření QR kódu…</Copy> : null}
        <LinkField aria-label="Odkaz na produkt" value={url} readOnly onFocus={event => event.currentTarget.select()}/>
        {notice ? <Copy role="status">{notice}</Copy> : null}
        <Actions style={{justifyContent:'center'}}><Button variant="secondary" onClick={copyLink}>Kopírovat odkaz</Button></Actions>
      </Stack>
    </ShareDialog>
  </>;
}
