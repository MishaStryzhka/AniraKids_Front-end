import styled from 'styled-components';
import { Check } from 'lucide-react';
import { designTokens as t } from '../../tokens/designTokens';

const swatches: Record<string,string> = {
  'Bílá':'#FFFFFF','Sněhově bílá':'#FAFCFF','Slonová kost':'#FFFFF0','Krémová':'#F3E9D2',
  'Šampaňská':'#EEDDC2','Béžová':'#D4BDA0','Písková':'#D7C29E','Tělová':'#DFC0AC',
  'Žlutá':'#EDCE63','Světle žlutá':'#F5E8AA','Hořčicová':'#BD983B','Oranžová':'#D99159',
  'Meruňková':'#EFB78E','Broskvová':'#F2C5AD','Lososová':'#EBA390','Korálová':'#DB7D75',
  'Červená':'#B74444','Tmavě červená':'#8B3038','Vínová':'#76384B','Bordó':'#692E3D',
  'Růžová':'#DF9EB5','Světle růžová':'#F4D4DD','Pudrově růžová':'#CDA4AA',
  'Starorůžová':'#B98691','Sytě růžová':'#C95689','Fuchsiová':'#B82F77','Malinová':'#AA3E65',
  'Fialová':'#987BAA','Světle fialová':'#D5C3E1','Levandulová':'#BAA9CF',
  'Šeříková':'#C5A4CB','Tmavě fialová':'#62466F','Švestková':'#704257',
  'Modrá':'#6088B3','Světle modrá':'#BED8E8','Blankytná':'#8CC2DE',
  'Královsky modrá':'#3C5AA6','Tmavě modrá':'#344B70','Námořnická modrá':'#29394E',
  'Petrolejová':'#376E78','Tyrkysová':'#6BAEAC','Zelená':'#7B9875',
  'Světle zelená':'#C0D5AB','Mátová':'#B7D8C5','Šalvějová':'#ACB9A3',
  'Olivová':'#8C9360','Khaki':'#99916B','Smaragdová':'#397D64','Tmavě zelená':'#355B47',
  'Hnědá':'#86654F','Světle hnědá':'#B89578','Karamelová':'#B58051',
  'Čokoládová':'#654638','Tmavě hnědá':'#4B3932','Šedá':'#A4A3A2',
  'Světle šedá':'#D4D3D2','Tmavě šedá':'#676666','Antracitová':'#44464A','Černá':'#292727',
  'Zlatá':'linear-gradient(135deg,#9E7938,#E7CF8E,#AE8847)',
  'Stříbrná':'linear-gradient(135deg,#979BA0,#ECEDEE,#AAAEB3)',
  'Růžově zlatá':'linear-gradient(135deg,#B4786F,#F1C8B7,#BF8E81)',
  'Bronzová':'linear-gradient(135deg,#825A39,#CCA476,#956B45)',
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
