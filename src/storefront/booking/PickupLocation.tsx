import styled from 'styled-components';
import { MapPin, ExternalLink } from 'lucide-react';
import { designTokens as t } from '../../design-system/tokens/designTokens';

const Card = styled.div`
  display:flex;align-items:flex-start;gap:${t.space[3]};
  padding:${t.space[4]};background:${t.color.bg.subtle};border-radius:${t.radius[2]};
  color:${t.color.text.primary};line-height:1.5;
  > svg{flex-shrink:0;margin-top:2px;}
  address{font-style:normal;overflow-wrap:anywhere;}
  p{margin:8px 0 0;font-size:14px;color:${t.color.text.secondary};}
  a{display:inline-flex;align-items:center;gap:8px;min-height:44px;
    color:${t.color.text.brand};text-underline-offset:3px;}
  a:focus-visible{outline:2px solid ${t.color.focus.ring};outline-offset:2px;}
`;

export function PickupLocation() {
  return <Card>
    <MapPin size={20} aria-hidden="true"/>
    <div>
      <strong>Místo vyzvednutí a vrácení</strong>
      <address>Kytlická 862/2<br/>190 00 Praha 9 – Prosek<br/>Česká republika</address>
      <p>Vchod č. 2. Předání po předchozí domluvě.</p>
      <a href="https://www.google.com/maps/search/?api=1&query=Kytlick%C3%A1%202%2C%20190%2000%20Praha%209%2C%20%C4%8Cesko" aria-label="Zobrazit na mapě (otevře se v nové kartě)" target="_blank" rel="noopener noreferrer">Zobrazit na mapě <ExternalLink size={16} aria-hidden="true"/></a>
    </div>
  </Card>;
}
