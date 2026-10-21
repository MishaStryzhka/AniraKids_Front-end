import {useSiteSettings} from '../siteSettings/SiteSettingsProvider';
import styled from 'styled-components';
import { Button } from '../design-system/components/Button';
import { Page, Panel, Title, Heading, Copy, Actions, RouteLink } from './storefrontStyles';
import { RentalSteps } from './RentalSteps';
import { getBookingPolicy } from './api/publicApi';
import { usePublicRead } from './usePublicRead';
import { BookingPaymentExplanation, CompanyInformation } from './payments/PaymentInformation';
import { routes } from '../navigation/routes';
const Questions=styled.div`display:grid;gap:16px;details{padding:20px;border:1px solid #e6ded8;border-radius:8px;}summary{cursor:pointer;font-weight:600;min-height:24px;}p{margin-top:16px;line-height:1.7;}`;
function PaymentDetails(){const policy=usePublicRead('information-policy',getBookingPolicy);return <Panel>{policy.loading?<Copy role="status">Načítání informací…</Copy>:policy.error?<><Copy role="alert">Informace se nepodařilo načíst.</Copy><Button onClick={policy.reload}>Zkusit znovu</Button></>:policy.data?<><BookingPaymentExplanation policy={policy.data}/><CompanyInformation company={policy.data.company}/></>:null}</Panel>;}
export function HowRentalPage(){const {sections}=useSiteSettings();return <Page><Title>Pronájem pro vaše výjimečné chvíle</Title><Copy>Od výběru oblečení až po jeho vrácení. Cenu konkrétního kousku a kauci vždy uvidíte před odesláním rezervace.</Copy><Panel id="jak-funguje-pronajem"><Heading>Jak funguje pronájem</Heading><RentalSteps/></Panel><PaymentDetails/><Actions>{sections.girlsDresses?<RouteLink to={routes.dresses}>Vybrat šaty</RouteLink>:null}{sections.womenDresses?<RouteLink to={routes.womenDresses}>Dámské šaty</RouteLink>:null}{sections.suits?<RouteLink to={routes.suits}>Vybrat oblek</RouteLink>:null}<RouteLink to="/zkouska">Rezervovat zkoušku</RouteLink><RouteLink to={routes.faq}>Časté dotazy</RouteLink></Actions></Page>;}
const questions=[
 ['Musím mít účet?','Rezervaci můžete vytvořit i bez registrace. Pro sledování si uschovejte soukromý odkaz na její stav. Rezervace vytvořené během přihlášení najdete také v části Můj účet → Moje rezervace.'],
 ['Je rezervace po odeslání potvrzená?','Ne. Po odeslání se zobrazí pokyny k platbě a platnost dočasné rezervace. Po přijetí zálohy rezervaci potvrdíme ručně. Před platbou vždy zkontrolujte aktuální stav a platnost pokynů.'],
 ['Jak mohu zaplatit?','Bankovním převodem pomocí QR kódu z rezervace nebo po předchozí domluvě osobně v hotovosti. Platba kartou přes platební bránu zatím není k dispozici.'],
 ['Je rezervační záloha totéž co kauce?','Ne. Záloha se započítá do nájemného. Vratná kauce je samostatná částka uvedená u vybraného oblečení a v souhrnu rezervace.'],
 ['Mohu si uložit oblíbené bez přihlášení?','Ano, pomocí srdíčka u oblečení. Bez přihlášení se seznam ukládá v tomto prohlížeči. Po přihlášení se propojí s oblíbenými ve vašem účtu.'],
 ['Kde probíhá předání a vrácení?','Konkrétní místo a čas si předem domluvíme. Sídlo společnosti uvedené v kontaktech není automaticky místem vyzvednutí.'],
 ['Co když potřebuji změnit nebo zrušit rezervaci?','Napište nám co nejdříve a uveďte číslo rezervace. Dostupnost jiného termínu ověříme. Případný storno poplatek posuzujeme individuálně podle podmínek rezervace.'],
];
export function FaqPage(){return <Page><Title>Časté dotazy</Title><Questions>{questions.map(([q,a])=><details key={q}><summary>{q}</summary><p>{a}</p></details>)}</Questions><Actions><RouteLink to={routes.rental}>Pronájem a platby</RouteLink><RouteLink to={routes.contact}>Mám jiný dotaz</RouteLink></Actions></Page>;}
const ContactLinks = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px 24px;
  a {
    display: inline-flex;
    align-items: center;
    min-block-size: 44px;
    max-inline-size: 100%;
    color: inherit;
    line-height: 1.6;
    overflow-wrap: anywhere;
    text-underline-offset: 3px;
  }
`;
export function ContactPage() {
  return <Page>
    <Title>Kontakt</Title>
    <Copy>Poradíme s výběrem, termínem i vaší rezervací.</Copy>
    <Panel>
      <Heading>Napište nám nebo zavolejte</Heading>
      <ContactLinks>
        <a href="mailto:glamgarbrentals@seznam.cz">glamgarbrentals@seznam.cz</a>
      </ContactLinks>
      <ContactLinks>
        <a href="tel:+420774032738">+420 774 032 738</a>
        <a href="tel:+420774032705">+420 774 032 705</a>
      </ContactLinks>
      <ContactLinks>
        <a href="https://www.instagram.com/anirakids_cz/" target="_blank" rel="noreferrer">Instagram · @anirakids_cz</a>
        <a href="https://wa.me/420774032738" target="_blank" rel="noreferrer">WhatsApp</a>
      </ContactLinks>
      <Copy>U existující rezervace prosím připojte její číslo.</Copy>
    </Panel>
    <Panel>
      <Heading>Provozovatel ANIRAK</Heading>
      <Copy>GlamGarb Rentals s.r.o. · IČO 19970561</Copy>
      <Copy>Bílkova 855/19, Staré Město, 110 00 Praha 1</Copy>
      <Copy>Zapsaná u Městského soudu v Praze, sp. zn. C 394851.</Copy>
      <Copy>Nejsme plátci DPH.</Copy>
      <Copy>Místo a čas předání domlouváme individuálně. Na adresu sídla prosím nejezděte bez předchozí domluvy.</Copy>
    </Panel>
  </Page>;
}
export function CookiesPage(){return <Page><Title>Cookies a úložiště prohlížeče</Title><Copy>Web používá úložiště prohlížeče, aby si pamatoval přihlášení, vaše volby a průběh rezervace.</Copy><Panel><Heading>Co si web pamatuje</Heading><Copy>Oblíbené položky bez účtu a informaci, zda jste se na zařízení již přihlásili, ukládáme místně. Dočasné údaje o rozpracované rezervaci a návratu z přihlášení pomáhají pokračovat ve stejné návštěvě.</Copy><Copy>Při přihlášení přes Google nebo Seznam se použije také služba zvoleného poskytovatele a jeho vlastní pravidla pro cookies a ochranu údajů.</Copy></Panel><Panel><Heading>Jak údaje odstranit</Heading><Copy>Uložená data webu můžete vymazat v nastavení prohlížeče pro anirakids.cz. Tím můžete ztratit místně uložené oblíbené, rozpracovanou rezervaci a přihlášení. Vymazání prohlížeče samo o sobě neruší rezervaci ani uživatelský účet.</Copy><RouteLink to={routes.privacy}>Ochrana osobních údajů</RouteLink></Panel></Page>;}
