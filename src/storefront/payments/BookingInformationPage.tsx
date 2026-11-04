import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { Button } from '../../design-system/components/Button';
import { routes } from '../../navigation/routes';
import { getBookingPolicy } from '../api/publicApi';
import { usePublicRead } from '../usePublicRead';
import { Page, Panel, Title, Heading, Copy, Actions, RouteLink } from '../storefrontStyles';
import { BookingPaymentExplanation } from './PaymentInformation';
import { cancellationSummary, depositRefundSummary } from './rentalPolicyCopy';

const Terms = styled(Page)`
  max-width: 960px;
  section { scroll-margin-top: 100px; }
  a { overflow-wrap: anywhere; }
  a:not([class]) { display: inline-block; padding-block: 10px; }
  @media print { max-width: none; section { break-inside: avoid; } }
`;

export function BookingInformationPage() {
  const policy = usePublicRead('booking-policy', getBookingPolicy);
  const fullTerms = useLocation().pathname === routes.terms;
  return <Terms>
    <Title>{fullTerms ? 'Obchodní podmínky pronájmu' : 'Podmínky pronájmu a vrácení'}</Title>
    <Copy>ANIRAK / AniraKids · Pronájem společenského oblečení v České republice.</Copy>
    <Copy>Tyto podmínky jsou určeny pro nové rezervace. Již sjednané rezervace se řídí podmínkami potvrzenými při jejich uzavření.</Copy>
    <Actions aria-label="Obsah podmínek">
      <RouteLink to={`${routes.terms}#storno`}>Zrušení a vrácení peněz</RouteLink>
      <RouteLink to={`${routes.terms}#kauce`}>Vratná kauce</RouteLink>
      <RouteLink to={`${routes.terms}#reklamace`}>Reklamace</RouteLink>
    </Actions>
    <Panel as="section">
      <Heading>Provozovatel a kontakt</Heading>
      <Copy>GlamGarb Rentals s.r.o., IČO 19970561, Bílkova 855/19, Staré Město, 110 00 Praha 1. Zapsaná u Městského soudu v Praze, oddíl C, vložka 394851. Nejsme plátci DPH.</Copy>
      <Copy>Dotazy, změny, zrušení rezervace a reklamace: <a href="mailto:glamgarbrentals@seznam.cz">glamgarbrentals@seznam.cz</a>, telefon <a href="tel:+420774032738">+420 774 032 738</a>. Uveďte prosím číslo rezervace, pokud je máte.</Copy>
      <Copy>Sídlo společnosti není výdejním místem. Osobní předání na adrese Kytlická 682/2 probíhá po předchozí domluvě.</Copy>
    </Panel>
    <Panel as="section">
      <Heading>Rezervace a uzavření smlouvy</Heading>
      <Copy>Vyberte oblečení, velikost, termín a způsob převzetí. Před odesláním můžete údaje zkontrolovat a opravit. Odeslání rezervace je žádostí o pronájem; přijetí žádosti ani platby samo o sobě není potvrzením pronájmu.</Copy>
      <Copy>Smlouva o pronájmu vzniká naším výslovným potvrzením rezervace. Potvrzení a údaje o rezervaci obdržíte e-mailem. Rezervace je sjednána na uvedený termín, v českém jazyce. Zprávy si uschovejte; kopii potvrzení si můžete vyžádat na našem e-mailu.</Copy>
      <Copy>Plaťte pouze podle aktuálních pokynů a ve lhůtě uvedené u rezervace. Platba po vypršení dočasné rezervace nezaručuje dostupnost. Pokud pronájem nepotvrdíme, vrátíme všechny částky přijaté k této rezervaci.</Copy>
    </Panel>
    <Panel as="section" id="platby">
      <Heading>Cena a platební možnosti</Heading>
      <Copy>Ceny jsou v Kč. Cena pronájmu, doprava, sleva a vratná kauce jsou uvedeny samostatně v souhrnu před odesláním. Kauce není cenou pronájmu. Nájemné se skládá z ceny prvního dne a případných dalších dnů podle tarifu vybraného oblečení; přesný rozpis uvidíte před odesláním. Pronájem na focení ve studiu je na jeden den.</Copy>
      {policy.loading ? <Copy role="status">Načítání platebních informací…</Copy> : policy.error ? <><Copy role="alert">Aktuální platební údaje se nepodařilo načíst. Ostatní podmínky jsou dostupné níže.</Copy><Actions><Button onClick={policy.reload}>Zkusit znovu</Button></Actions></> : policy.data ? <BookingPaymentExplanation policy={policy.data} /> : null}
      <Copy>Dostupné způsoby platby uvádíme u rezervace. Pokud je nabídnuta online platba, údaje karty bezpečně zpracovává Revolut; dostupnost Apple Pay a Google Pay závisí na zařízení a nastavení peněženky. O přijaté platbě vystavujeme příslušný doklad.</Copy>
    </Panel>
    <Panel as="section" id="doprava">
      <Heading>Převzetí, doručení a vrácení oblečení</Heading>
      <Copy>Osobní převzetí je zdarma, čas si domluvíme předem. Pro pronájem mimo studio lze zvolit doručení v České republice: Balíkovna do výdejního místa nebo boxu za celkem 178 Kč (89 Kč každým směrem), Balíkovna na adresu za celkem 238 Kč (119 Kč každým směrem).</Copy>
      <Copy>Součet nové rezervace obsahuje dopravu k vám i zpět. Štítek pro vrácení najdete v balíčku. Pro přepravu počítáme se 2 pracovními dny v každém směru; tyto dny se nezapočítávají do placeného pronájmu. Neodesílejte balík na sídlo společnosti bez domluvy.</Copy>
      <Copy>Termín expedice a předpokládaného doručení potvrdíme před odesláním s ohledem na sjednaný termín použití. Pokud jej nelze zajistit, nabídneme změnu, nebo rezervaci zrušíme a vrátíme přijaté platby. Změna termínu nebo ceny vyžaduje váš souhlas.</Copy>
      <Copy>Při osobním vrácení předejte oblečení nejpozději v poslední sjednaný den ve smluvený čas. Při vracení dopravcem zásilku nejpozději v poslední den pronájmu předejte dopravci, uschovejte potvrzení a pošlete nám sledovací číslo. Pouhé vytvoření štítku není předáním zásilky.</Copy>
      <Copy>Oblečení bezpečně zabalte a vraťte se všemi zapůjčenými součástmi. Při převzetí nám oznamte zjištěné vady; pozdější oznámení samo o sobě nevylučuje vaše zákonná práva. O zpoždění nebo problému s dopravou nás informujte co nejdříve.</Copy>
    </Panel>
    <Panel as="section" id="kauce">
      <Heading>Vratná kauce a péče o oblečení</Heading>
      <Copy>{depositRefundSummary}</Copy>
      <Copy>Při vrácení přepravou se lhůta počítá od doručení k nám. Připsání bankovního nebo karetního vrácení může navíc záviset na zpracování poskytovatelem platby.</Copy>
      <Copy>Případné zadržení části kauce musí odpovídat konkrétnímu doloženému nároku, například poškození nad rámec běžného opotřebení nebo chybějící součásti. Důvod, podklady a vyčíslení vám sdělíme; nezadrženou část vrátíme ve výše uvedené lhůtě. Běžné opotřebení při řádném užívání není důvodem ke srážce.</Copy>
      <Copy>Oblečení používejte šetrně a dodržujte předané pokyny. Bez dohody neprovádějte úpravy ani opravy; při poškození nás kontaktujte.</Copy>
    </Panel>
    <Panel as="section" id="storno">
      <Heading>Změna, zrušení a vrácení plateb</Heading>
      <Copy>{cancellationSummary}</Copy>
      <Copy>Žádost pošlete na náš kontaktní e-mail. Rozhoduje okamžik doručení žádosti a sjednaný začátek pronájmu v českém místním čase. Není-li čas začátku sjednán, počítáme jej pro storno od 00:00 prvního dne pronájmu. Změnu termínu potvrdíme podle dostupnosti.</Copy>
      <Copy>Storno poplatek není automatický. Před případným započtením vám sdělíme důvod a výši; nesmí převýšit cenu pronájmu. Zbytek přijatých plateb včetně kauce vrátíme. Již absolvovaná placená zkouška je samostatně poskytnutou službou.</Copy>
      <Copy>Pokud rezervaci zrušíme my nebo ji nemůžeme potvrdit, vrátíme všechny platby za neposkytnutý pronájem včetně dopravy a kauce, bez storno poplatku. Vrácení plateb po zrušení zadáme nejpozději do 3 pracovních dnů od zrušení. Vaše další zákonná práva tím nejsou dotčena.</Copy>
      <Copy>Peníze vracíme původním způsobem platby. Platby provedené kartou nebo přes Revolut vracíme přes původního poskytovatele platby, nikoli v hotovosti. Hotovostní kauci lze při osobním vrácení a kontrole vrátit ihned v hotovosti. Bankovní připsání není totéž co den zadání vrácení.</Copy>
    </Panel>
    {fullTerms ? <>
      <Panel as="section" id="odstoupeni">
        <Heading>Odstoupení spotřebitele od smlouvy</Heading>
        <Copy>Spotřebitel má u smlouvy uzavřené na dálku právo odstoupit do 14 dnů od jejího uzavření, pokud se neuplatní zákonná výjimka. Samotné sjednání termínu pronájmu nepovažujeme za automatické vyloučení tohoto práva. Za uplatnění zákonného práva neúčtujeme storno poplatek.</Copy>
        <Copy>Odstoupení stačí v této lhůtě odeslat e-mailem nebo písemně na sídlo společnosti. Můžete použít níže uvedený vzor, není to povinné. Přijetí potvrdíme e-mailem a vrátíme peníze nejpozději do 14 dnů od doručení odstoupení, zpravidla dříve podle našich pravidel vrácení plateb.</Copy>
        <Copy>Má-li služba začít před uplynutím 14 dnů, vyžádáme si před zahájením vaši výslovnou žádost a poučíme vás o jejích důsledcích. Při následném odstoupení lze požadovat jen zákonnou poměrnou úhradu skutečně poskytnutého plnění, jsou-li splněny zákonné podmínky. Právo zaniká úplným poskytnutím služby pouze při splnění zákonných podmínek včetně předchozího výslovného souhlasu a poučení.</Copy>
        <Copy>Pokud už máte oblečení u sebe, kontaktujte nás pro jeho vrácení. Běžné náklady na odeslání zpět nese zákazník; tím nejsou omezena práva při vadném plnění. Storno pravidla a odstoupení jsou odlišné postupy.</Copy>
        <Heading as="h3">Vzor oznámení o odstoupení</Heading>
        <Copy>Adresát: GlamGarb Rentals s.r.o., Bílkova 855/19, Staré Město, 110 00 Praha 1, glamgarbrentals@seznam.cz.</Copy>
        <Copy>Oznamuji, že odstupuji od smlouvy o pronájmu / poskytnutí služby. Číslo rezervace: … Datum uzavření smlouvy: … Jméno a příjmení: … Adresa: … Datum: … Podpis (pouze při zaslání v listinné podobě): …</Copy>
      </Panel>
      <Panel as="section" id="reklamace">
        <Heading>Reklamace a řešení sporů</Heading>
        <Copy>Pokud oblečení nebo služba neodpovídá dohodě, napište na glamgarbrentals@seznam.cz nebo nás kontaktujte na výše uvedeném telefonu. Reklamaci lze uplatnit také písemně na adrese sídla. Popište problém a požadovaný způsob řešení; číslo rezervace a fotografie pomohou, nejsou však podmínkou přijetí reklamace.</Copy>
        <Copy>Potvrdíme přijetí reklamace, její obsah a požadovaný způsob vyřízení. O výsledku vás informujeme. Reklamaci spotřebitele vyřídíme a oznámíme výsledek nejpozději do 30 dnů, pokud se výslovně nedohodneme na delší lhůtě. Zákonná práva na nápravu, slevu nebo odstoupení zůstávají zachována.</Copy>
        <Copy>Pokud spor nevyřešíme přímo, můžete se obrátit na Českou obchodní inspekci, která je příslušným subjektem mimosoudního řešení spotřebitelských sporů: <a href="https://coi.gov.cz/informace-o-adr/" target="_blank" rel="noreferrer">coi.gov.cz/informace-o-adr/</a>. Tím není dotčeno právo obrátit se na soud.</Copy>
      </Panel>
    </> : <Panel><Heading>Vaše spotřebitelská práva</Heading><Copy>Pravidla odstoupení do 14 dnů, vzor oznámení, reklamace a mimosoudní řešení sporů najdete v obchodních podmínkách. Zákonná práva mají přednost před storno pravidly.</Copy><RouteLink to={routes.terms}>Úplné obchodní podmínky</RouteLink></Panel>}
    <Actions><RouteLink to={routes.contact}>Kontakt</RouteLink><RouteLink to={routes.privacy}>Ochrana osobních údajů</RouteLink><RouteLink to={routes.rental}>Jak funguje pronájem</RouteLink></Actions>
  </Terms>;
}
