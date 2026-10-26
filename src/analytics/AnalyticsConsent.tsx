import {useEffect, useLayoutEffect, useState} from 'react';
import {useLocation, Link} from 'react-router-dom';
import styled from 'styled-components';
import {Button} from '../design-system/components/Button';
import {designTokens as t} from '../design-system/tokens/designTokens';
import {CONSENT_EVENT, CONSENT_KEY, readConsent, setConsent, syncAnalyticsPage, syncStoredConsent, publicPage, productionHost} from './analytics';
const Box = styled.section`
  padding: ${t.space[4]}; background: ${t.color.bg.subtle}; border-bottom: 1px solid ${t.color.border.default};
  color: ${t.color.text.primary}; font-family: ${t.font.family.ui};
  > div {max-width:1120px;margin:auto;} h2{font-size:18px;margin:0 0 8px;} p{font-size:14px;line-height:1.6;margin:0 0 12px;}
  a{color:inherit;text-decoration:underline;} 
`;
const Actions = styled.div`display:flex;gap:12px;flex-wrap:wrap;@media(max-width:430px){>button{width:100%;}}`;
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
 return <Box aria-labelledby="analytics-consent-title"><div><h2 id="analytics-consent-title">Vaše soukromí</h2><p>Nezbytné úložiště zajišťuje fungování webu. S vaším souhlasem používáme Google Analytics k měření návštěvnosti a zlepšování rezervací. Volbu můžete kdykoli změnit v části <Link to="/cookies">Cookies</Link>.</p><Choices/></div></Box>;
}
export function AnalyticsPreferences(){const choice=useChoice();return <><p>Google Analytics spouštíme pouze s vaším souhlasem. Měří návštěvy veřejných stránek, prohlížení produktů a vytvoření rezervace či zkoušky. Jména, kontaktní údaje ani soukromé odkazy do analytiky neposíláme. Reklamní personalizaci nepoužíváme.</p><p>Volbu si pamatujeme nejvýše 180 dní. Analytické cookies _ga a _ga_* mají platnost nejvýše 180 dní. Odmítnutí nemá vliv na možnost rezervace.</p><p role="status">Analytika: {choice==='granted'?'povolena':choice==='denied'?'odmítnuta':'čeká na vaši volbu'}.</p><Choices/><p><a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">Ochrana soukromí Google</a></p></>;}
