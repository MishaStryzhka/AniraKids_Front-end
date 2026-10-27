import {useEffect, useLayoutEffect, useState} from 'react';
import {useLocation, Link} from 'react-router-dom';
import styled from 'styled-components';
import {Cookie} from 'lucide-react';
import {Button} from '../design-system/components/Button';
import {designTokens as t} from '../design-system/tokens/designTokens';
import {CONSENT_EVENT, CONSENT_KEY, readConsent, setConsent, syncAnalyticsPage, syncStoredConsent, publicPage, productionHost} from './analytics';
const Box = styled.section`
  position: fixed;
  z-index: ${t.layer.sticky};
  inset-inline-end: max(24px, env(safe-area-inset-right));
  inset-block-end: max(24px, env(safe-area-inset-bottom));
  width: min(480px, calc(100vw - 48px));
  max-height: calc(100dvh - 48px);
  overflow-y: auto;
  padding: 24px;
  background: ${t.color.bg.surface};
  border: 1px solid ${t.color.border.default};
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(50, 40, 32, 0.14);
  color: ${t.color.text.primary};
  font-family: ${t.font.family.ui};
  h2{font-size:18px;line-height:1.4;margin:0;font-weight:600;}
  p{font-size:14px;line-height:1.65;margin:12px 0 20px;color:${t.color.text.muted};}
  a{color:${t.color.text.primary};text-decoration:underline;text-underline-offset:3px;}
  @media(max-width:767px){
    inset-inline: 12px;
    inset-block-end: max(12px, env(safe-area-inset-bottom));
    width:auto;max-height:calc(100dvh - 24px);padding:20px;border-radius:14px;
    p{margin:12px 0 16px;}
  }
`;
const BannerHeading = styled.div`
  display:flex;align-items:center;gap:12px;
  >span{display:grid;place-items:center;width:36px;height:36px;flex-shrink:0;border-radius:50%;background:${t.color.bg.subtle};color:${t.color.text.muted};}
`;
const Actions = styled.div`
  display:flex;gap:12px;flex-wrap:wrap;
  >button{flex:1;min-height:44px;white-space:normal;}
  @media(max-width:374px){>button{flex-basis:100%;}}
`;
function useChoice() {
 const [choice, update] = useState(readConsent);
 useEffect(()=>{const listener=()=>update(readConsent());window.addEventListener(CONSENT_EVENT,listener);return()=>window.removeEventListener(CONSENT_EVENT,listener);},[]);
 return choice;
}
function Choices(){return <Actions><Button variant="secondary" onClick={()=>setConsent('denied')}>Pouze nezbytné</Button><Button variant="secondary" onClick={()=>setConsent('granted')}>Povolit analytiku</Button></Actions>;}
export function AnalyticsConsent(){
 const location=useLocation(),choice=useChoice();
 useLayoutEffect(()=>{syncAnalyticsPage();},[location.pathname]);
 useEffect(()=>{const listener=(e:StorageEvent)=>{if(e.key===CONSENT_KEY||e.key===null)syncStoredConsent();};window.addEventListener('storage',listener);return()=>window.removeEventListener('storage',listener);},[]);
 if(!productionHost()||choice||publicPage(location.pathname)===null||location.pathname==='/cookies')return null;
 return <Box aria-labelledby="analytics-consent-title"><BannerHeading><span aria-hidden="true"><Cookie size={20} strokeWidth={1.5}/></span><h2 id="analytics-consent-title">Vaše soukromí</h2></BannerHeading><p>S vaším souhlasem používáme Google Analytics, abychom zlepšovali web a rezervace. Bez souhlasu používáme pouze nezbytné úložiště. Svou volbu můžete kdykoli změnit v části <Link to="/cookies">Cookies</Link>.</p><Choices/></Box>;
}
export function AnalyticsPreferences(){const choice=useChoice();return <><p>Google Analytics spouštíme pouze s vaším souhlasem. Měří návštěvy veřejných stránek, prohlížení produktů a vytvoření rezervace či zkoušky. Jména, kontaktní údaje ani soukromé odkazy do analytiky neposíláme. Reklamní personalizaci nepoužíváme.</p><p>Volbu si pamatujeme nejvýše 180 dní. Analytické cookies _ga a _ga_* mají platnost nejvýše 180 dní. Odmítnutí nemá vliv na možnost rezervace.</p><p role="status">Analytika: {choice==='granted'?'povolena':choice==='denied'?'odmítnuta':'čeká na vaši volbu'}.</p><Choices/><p><a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">Ochrana soukromí Google</a></p></>;}
