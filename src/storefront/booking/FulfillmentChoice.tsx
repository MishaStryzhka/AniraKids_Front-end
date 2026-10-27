import { useEffect, useId, useRef, useState } from 'react';
import styled from 'styled-components';
import { Store } from 'lucide-react';
import { Input } from '../../design-system/components/Input';
import { Button } from '../../design-system/components/Button';
import { designTokens as t } from '../../design-system/tokens/designTokens';
import { Actions, Copy, ErrorCopy, Stack } from '../storefrontStyles';
import { deliveryNotice, pointFromMessage, type Fulfillment } from './fulfillment';
const Fieldset = styled.fieldset`
  margin:0; padding:0; border:0; min-width:0;
  legend { font-size:18px; font-weight:600; margin-bottom:${t.space[3]}; }
`;
const Choices = styled.div`
  display:grid; grid-template-columns:1fr; gap:${t.space[3]};

`;
const Choice = styled.label<{$selected:boolean}>`
  display:flex; align-items:center; gap:${t.space[3]}; min-height:64px; padding:${t.space[3]};
  border:1px solid ${p=>p.$selected?t.color.border.strong:t.color.border.subtle};
  border-radius:${t.radius[2]}; background:${p=>p.$selected?t.color.bg.subtle:t.color.bg.surface}; cursor:pointer;
  img{width:112px;max-height:36px;object-fit:contain;} strong{margin-left:auto;white-space:nowrap;}
  input{accent-color:${t.color.text.brand};} svg{flex-shrink:0;}
  &:focus-within{outline:2px solid ${t.color.focus.ring};outline-offset:2px;}
`;
const DeliveryChoice = styled(Choice)`
  display:grid;grid-template-columns:20px 112px minmax(0,1fr) auto;
  padding:${t.space[4]};gap:${t.space[3]};
  .description{font-size:13px;line-height:1.5;}
  .description strong{margin:0;white-space:normal;}
  .prices{display:flex;flex-direction:column;align-items:flex-end;gap:4px;font-size:14px;white-space:nowrap;}
  .prices small{font-size:12px;font-weight:400;color:${t.color.text.secondary};}
  .prices strong{margin:0;}
  @media(max-width:600px){
    grid-template-columns:20px minmax(0,1fr) auto;
    .description{grid-column:2 / -1;grid-row:2;}
    .prices{grid-column:3;grid-row:1;}
  }
`;
const MapDialog = styled.dialog`
  border:0;border-radius:${t.radius[2]};padding:${t.space[4]};width:min(960px,calc(100vw - 24px));max-width:none;max-height:96dvh;overflow:auto;
  &::backdrop{background:rgba(0,0,0,.45);}
  @media(max-width:600px){width:100vw;height:100dvh;max-height:100dvh;margin:0;border-radius:0;padding:8px;}
`;
const Map = styled.iframe`
  display:block;width:100%;height:min(800px,80dvh);min-height:400px;border:1px solid ${t.color.border.subtle};border-radius:${t.radius[2]};
`;
const Point = styled.div`padding:${t.space[4]};border-radius:${t.radius[2]};background:${t.color.bg.subtle};overflow-wrap:anywhere;`;
export function FulfillmentSummary({value}:{value:Fulfillment}) {
  if (!value.fulfillmentMethod) return null;
  return <Stack>
    <Copy><strong>Způsob převzetí: </strong>{value.fulfillmentMethod==='balikovna'?'Balíkovna':value.fulfillmentMethod==='balikovna_address'?'Balíkovna na adresu':'Osobní vyzvednutí – Kytlická 682/2'}</Copy>
    {value.deliveryAddress ? <Copy>{value.deliveryAddress.street}, {value.deliveryAddress.zip} {value.deliveryAddress.city}, Česká republika</Copy> : null}
    {value.fulfillmentMethod==='balikovna' ? <>
      {value.balikovnaPoint ? <Copy>{value.balikovnaPoint.name} · {value.balikovnaPoint.address}<br/>PSČ Balíkovny: {value.balikovnaPoint.zip}</Copy>:null}
      <Copy>{deliveryNotice}</Copy>
    </>:null}
  </Stack>;
}
export function FulfillmentChoice({value,onChange,disabled,error}:{value:Fulfillment;onChange(value:Fulfillment):void;disabled?:boolean;error?:string}) {
  const id=useId(), frame=useRef<HTMLIFrameElement>(null), button=useRef<HTMLDivElement>(null);
  const [open,setOpen]=useState(false);
  const dialog=useRef<HTMLDialogElement>(null);
  useEffect(()=>{if(open){dialog.current?.showModal();}else{dialog.current?.close();}},[open]);
  const callback=useRef(onChange); callback.current=onChange;
  const method=value.fulfillmentMethod??'pickup';
  useEffect(()=>{
    if(!open||disabled||method!=='balikovna')return;
    const listener=(event:MessageEvent)=>{const point=pointFromMessage(event,frame.current?.contentWindow??null);if(point){callback.current({fulfillmentMethod:'balikovna',balikovnaPoint:point});setOpen(false);button.current?.querySelector('button')?.focus();}};
    window.addEventListener('message',listener);return()=>window.removeEventListener('message',listener);
  },[open,disabled,method]);
  return <Fieldset disabled={disabled} aria-describedby={error?id:undefined}>
    <legend>Způsob převzetí</legend><Stack>
    <Choices>
      <Choice $selected={method==='pickup'}><input type="radio" name="fulfillmentMethod" value="pickup" aria-label="Osobní vyzvednutí" checked={method==='pickup'} onChange={()=>{setOpen(false);onChange({fulfillmentMethod:'pickup'});}}/><Store size={20} aria-hidden="true"/><span>Osobní vyzvednutí</span><strong>Zdarma</strong></Choice>
      <DeliveryChoice $selected={method==='balikovna'}><input type="radio" name="fulfillmentMethod" value="balikovna" aria-label="Balíkovna" checked={method==='balikovna'} onChange={()=>onChange({fulfillmentMethod:'balikovna'})}/><img src="/delivery/balikovna.svg" alt="Balíkovna"/><span className="description">Vyberte si box nebo výdejní místo, které vám vyhovuje. <strong>Balíkovna je všude!</strong></span><span className="prices"><small>Doručení</small><strong>89 Kč</strong><small>Vrácení: 89 Kč</small></span></DeliveryChoice>
      <DeliveryChoice $selected={method==='balikovna_address'}><input type="radio" name="fulfillmentMethod" value="balikovna_address" aria-label="Balíkovna na adresu" checked={method==='balikovna_address'} onChange={()=>{setOpen(false);onChange({fulfillmentMethod:'balikovna_address',deliveryAddress:{street:'',city:'',zip:'',country:'CZ'}});}}/><img src="/delivery/balikovna-address.svg" alt="Balíkovna na adresu"/><span className="description">Doručíme i na vámi vybranou adresu. <strong>Balíkovna je všude!</strong></span><span className="prices"><small>Doručení</small><strong>119 Kč</strong><small>Vrácení: 119 Kč</small></span></DeliveryChoice>
    </Choices>
    {method==='balikovna_address'?<Stack><Copy>Doručení na adresu v České republice.</Copy>{(['street','city','zip'] as const).map(field=><Input key={field} label={{street:'Ulice a číslo domu',city:'Město',zip:'PSČ'}[field]} name={'delivery-'+field} autoComplete={{street:'shipping address-line1',city:'shipping address-level2',zip:'shipping postal-code'}[field]} value={value.deliveryAddress?.[field]??''} onChange={event=>onChange({fulfillmentMethod:'balikovna_address',deliveryAddress:{street:'',city:'',zip:'',country:'CZ',...value.deliveryAddress,[field]:field==='zip'?event.target.value.replace(/\s/g,''):event.target.value}})}/>) }<Copy>{deliveryNotice}</Copy>{error?<ErrorCopy role="alert" id={id}>{error}</ErrorCopy>:null}</Stack>:method==='pickup'?<Copy>Osobní vyzvednutí: Kytlická 682/2. Čas předání si domluvíme.</Copy>:<>
      <Copy>{deliveryNotice}</Copy>
      {value.balikovnaPoint?<Point role="status"><strong>{value.balikovnaPoint.name}</strong><br/>{value.balikovnaPoint.address}<br/>PSČ Balíkovny: {value.balikovnaPoint.zip}</Point>:null}
      <Actions ref={button}><Button type="button" variant="secondary" aria-expanded={open} onClick={()=>setOpen(v=>!v)}>{open?'Zavřít mapu':value.balikovnaPoint?'Změnit výdejní místo':'Vybrat výdejní místo'}</Button></Actions>
      {error?<ErrorCopy id={id} role="alert">{error}</ErrorCopy>:null}
      {open?<MapDialog ref={dialog} aria-label="Vybrat výdejní místo Balíkovny" onCancel={()=>setOpen(false)}><Button type="button" variant="secondary" onClick={()=>setOpen(false)}>Zavřít mapu</Button><Copy>Pokud se mapa nenačte, zavřete ji a zkuste znovu. Případně nás kontaktujte pro domluvu dopravy.</Copy><Map ref={frame} title="Výběr výdejního místa Balíkovny" src="https://b2c.cpost.cz/locations/?type=BALIKOVNY&skipLocation=true" allow="geolocation" referrerPolicy="no-referrer"/><Button type="button" variant="secondary" onClick={()=>{setOpen(false);button.current?.querySelector('button')?.focus();}}>Zavřít mapu</Button></MapDialog>:null}
    </>}
    </Stack>
  </Fieldset>;
}
