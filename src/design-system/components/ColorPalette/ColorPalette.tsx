import styled from 'styled-components';
import { Check } from 'lucide-react';
import { designTokens as t } from '../../tokens/designTokens';

const swatches: Record<string,string> = {
  'Bílá':'#FFFFFF','Krémová':'#F3E9D2','Béžová':'#D4BDA0','Žlutá':'#EDCE63',
  'Oranžová':'#D99159','Červená':'#B74444','Vínová':'#76384B','Růžová':'#DF9EB5',
  'Světle růžová':'#F4D4DD','Pudrově růžová':'#CDA4AA','Sytě růžová':'#C95689',
  'Fialová':'#987BAA','Světle fialová':'#D5C3E1','Modrá':'#6088B3','Světle modrá':'#BED8E8',
  'Tyrkysová':'#6BAEAC','Zelená':'#7B9875','Hnědá':'#86654F','Šedá':'#A4A3A2',
  'Černá':'#292727','Zlatá':'linear-gradient(135deg,#9E7938,#E7CF8E,#AE8847)',
  'Stříbrná':'linear-gradient(135deg,#979BA0,#ECEDEE,#AAAEB3)',
  'Vícebarevná':'conic-gradient(#D7A1B6,#B9A7CE,#A3C3D8,#B6C7A0,#EBD49D,#D7A1B6)',
};
export const PRODUCT_COLOR_OPTIONS = Object.keys(swatches);
const Row = styled.div`display:flex;flex-wrap:wrap;gap:4px;min-inline-size:0;`;
const SwatchButton = styled.button<{ $selected:boolean }>`
  position:relative;display:inline-flex;align-items:center;justify-content:center;
  min-width:44px;min-height:44px;padding:5px;border:1px solid transparent;border-radius:50%;
  background:transparent;color:${t.color.text.primary};cursor:pointer;
  border-color:${p=>p.$selected?t.color.text.primary:'transparent'};
  &:hover:not(:disabled){background:${t.color.bg.surface};border-color:${t.color.border.subtle};}
  &:focus-visible{outline:2px solid ${t.color.focus.ring};outline-offset:2px;}
  &:disabled{opacity:.4;cursor:not-allowed;}
`;
const Dot = styled.span<{ $paint:string }>`display:block;width:30px;height:30px;border-radius:50%;background:${p=>p.$paint};box-shadow:inset 0 0 0 1px rgba(60,45,35,.18);`;
const Tick = styled.span`position:absolute;right:0;bottom:0;width:16px;height:16px;display:grid;place-items:center;border-radius:50%;background:${t.color.text.primary};color:white;`;
const Custom = styled.span`font:inherit;font-size:12px;max-width:120px;overflow-wrap:anywhere;`;
export function ColorPalette({colors,selected,label,disabled=false,isDisabled,onToggle}: {
  colors:string[];selected:string[];label:string;disabled?:boolean;isDisabled?:(color:string)=>boolean;onToggle:(color:string)=>void;
}) {
  return <Row role="group" aria-label={label}>{colors.map(color=>{
    const chosen=selected.some(item=>item.toLowerCase()===color.toLowerCase());
    const canonical=PRODUCT_COLOR_OPTIONS.find(item=>item.toLowerCase()===color.toLowerCase());
    return <SwatchButton key={color} type="button" title={color} aria-label={color} aria-pressed={chosen} $selected={chosen}
      disabled={disabled||Boolean(isDisabled?.(color))} onClick={()=>onToggle(color)}>
      {canonical?<Dot aria-hidden="true" $paint={swatches[canonical]}/>:<Custom>{color}</Custom>}
      {chosen?<Tick aria-hidden="true"><Check size={12} strokeWidth={2.5}/></Tick>:null}
    </SwatchButton>;
  })}</Row>;
}
