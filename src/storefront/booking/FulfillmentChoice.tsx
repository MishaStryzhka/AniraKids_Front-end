import { useEffect, useId, useRef, useState } from 'react';
import styled from 'styled-components';
import { Store, Truck } from 'lucide-react';
import { Button } from '../../design-system/components/Button';
import { designTokens as t } from '../../design-system/tokens/designTokens';
import { Actions, Copy, ErrorCopy, Stack } from '../storefrontStyles';
import { deliveryNotice, pointFromMessage, type Fulfillment } from './fulfillment';
const Fieldset = styled.fieldset`
  margin:0; padding:0; border:0; min-width:0;
  legend { font-size:18px; font-weight:600; margin-bottom:${t.space[3]}; }
`;
const Choices = styled.div`
  display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:${t.space[3]};
  @media(max-width:479px){grid-template-columns:1fr;}
`;
const Choice = styled.label<{$selected:boolean}>`
  display:flex; align-items:center; gap:${t.space[3]}; min-height:64px; padding:${t.space[3]};
  border:1px solid ${p=>p.$selected?t.color.border.strong:t.color.border.subtle};
  border-radius:${t.radius[2]}; background:${p=>p.$selected?t.color.bg.subtle:t.color.bg.surface}; cursor:pointer;
  input{accent-color:${t.color.text.brand};} svg{flex-shrink:0;}
  &:focus-within{outline:2px solid ${t.color.focus.ring};outline-offset:2px;}
`;
const Map = styled.iframe`
  display:block;width:100%;height:min(800px,80dvh);min-height:400px;border:1px solid ${t.color.border.subtle};border-radius:${t.radius[2]};
`;
const Point = styled.div`padding:${t.space[4]};border-radius:${t.radius[2]};background:${t.color.bg.subtle};overflow-wrap:anywhere;`;
export function FulfillmentSummary({value}:{value:Fulfillment}) {
  if (!value.fulfillmentMethod) return null;
  return <Stack>
    <Copy><strong>Způsob převzetí: </strong>{value.fulfillmentMethod==='balikovna'?'Balíkovna':'Osobní vyzvednutí'}</Copy>
    {value.fulfillmentMethod==='balikovna' ? <>
      {value.balikovnaPoint ? <Copy>{value.balikovnaPoint.name} · {value.balikovnaPoint.address}<br/>PSČ Balíkovny: {value.balikovnaPoint.zip}</Copy>:null}
      <Copy>{deliveryNotice}</Copy>
    </>:null}
  </Stack>;
}
export function FulfillmentChoice({value,onChange,disabled,error}:{value:Fulfillment;onChange(value:Fulfillment):void;disabled?:boolean;error?:string}) {
  const id=useId(), frame=useRef<HTMLIFrameElement>(null), button=useRef<HTMLDivElement>(null);
  const [open,setOpen]=useState(false);
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
      <Choice $selected={method==='pickup'}><input type="radio" name="fulfillmentMethod" value="pickup" checked={method==='pickup'} onChange={()=>{setOpen(false);onChange({fulfillmentMethod:'pickup'});}}/><Store size={20} aria-hidden="true"/><span>Osobní vyzvednutí</span></Choice>
      <Choice $selected={method==='balikovna'}><input type="radio" name="fulfillmentMethod" value="balikovna" checked={method==='balikovna'} onChange={()=>onChange({fulfillmentMethod:'balikovna'})}/><Truck size={20} aria-hidden="true"/><span>Balíkovna</span></Choice>
    </Choices>
    {method==='pickup'?<Copy>Místo a čas osobního předání si společně domluvíme.</Copy>:<>
      <Copy>{deliveryNotice}</Copy>
      {value.balikovnaPoint?<Point role="status"><strong>{value.balikovnaPoint.name}</strong><br/>{value.balikovnaPoint.address}<br/>PSČ Balíkovny: {value.balikovnaPoint.zip}</Point>:null}
      <Actions ref={button}><Button type="button" variant="secondary" aria-expanded={open} onClick={()=>setOpen(v=>!v)}>{open?'Zavřít mapu':value.balikovnaPoint?'Změnit výdejní místo':'Vybrat výdejní místo'}</Button></Actions>
      {error?<ErrorCopy id={id} role="alert">{error}</ErrorCopy>:null}
      {open?<><Copy>Pokud se mapa nenačte, zavřete ji a zkuste znovu. Případně nás kontaktujte pro domluvu dopravy.</Copy><Map ref={frame} title="Výběr výdejního místa Balíkovny" src="https://b2c.cpost.cz/locations/?type=BALIKOVNY&skipLocation=true" allow="geolocation" referrerPolicy="no-referrer"/><Button type="button" variant="secondary" onClick={()=>{setOpen(false);button.current?.querySelector('button')?.focus();}}>Zavřít mapu</Button></>:null}
    </>}
    </Stack>
  </Fieldset>;
}
