import {FulfillmentChoice, FulfillmentSummary} from './FulfillmentChoice';
import {fulfillmentError, shippingPrice} from './fulfillment';
import {trackAvailability} from '../../analytics/analytics';
import {useSiteSettings} from '../../siteSettings/SiteSettingsProvider';
import {useLiveReservation} from './useLiveReservation';
import {FittingDiscountPicker,type FittingDiscountSelection} from '../../fittings/FittingDiscount';
import { RentalPriceRows } from '../payments/RentalPriceRows';
import styled from 'styled-components';
import {discountQuotes} from '../../partner/discount';
import { X, Shirt } from 'lucide-react';
import { IconButton } from '../../design-system/components/IconButton';
import { designTokens as t } from '../../design-system/tokens/designTokens';
import { RentalCalendar } from './RentalCalendar';
import {
  BookingPaymentExplanation,
  ReceiptPaymentInformation,
  CompanyInformation,
} from '../payments/PaymentInformation';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getCatalogueReturnTo } from '../catalogueNavigation';
import { Button } from '../../design-system/components/Button';
import { Input } from '../../design-system/components/Input';
import { SelectField } from '../../design-system/components/SelectField';
import { TextareaField } from '../../design-system/components/TextareaField';
import {
  formatCalendarDay,
  pragueToday,
} from '../../admin/calendar/calendarDates';
import { routes } from '../../navigation/routes';
import {
  getAvailability,
  getBookingPolicy,
  PublicApiError,
  sameSelection,
  receiptItems,
  type Pricing,
  type Selection,
} from '../api/publicApi';
import {
  Actions,
  Alert,
  Columns,
  Copy,
  ErrorCopy,
  Facts,
  Heading,
  Page,
  Panel,
  RouteLink,
  Stack,
  Title,
} from '../storefrontStyles';
import { usePublicRead } from '../usePublicRead';
import { useBooking } from './BookingProvider';
import { reservationStatusPath } from './BookingStatusPage';
import {
  contactErrors,
  draftItems,
  draftSelections,
  draftSelectionsValid,
  formatMoney,
  modeLabel,
  selectionErrors,
  statusLabel,
} from './bookingModel';
const ItemCard = styled(Stack)`
  gap: ${t.space[2]} ${t.space[3]};
  grid-template-columns:72px minmax(0,1fr);
  align-content:start;
  > :not(:first-child){grid-column:2;}
  @media(max-width:767px){grid-template-columns:60px minmax(0,1fr);h3{font-size:18px;line-height:1.4;}}
`;
const Thumbnail = styled.div`
  grid-column:1;grid-row:1 / span 3;align-self:start;aspect-ratio:3/4;overflow:hidden;border-radius:8px;background:${t.color.bg.subtle};display:grid;place-items:center;color:${t.color.text.muted};
  img{width:100%;height:100%;object-fit:cover;}
`;
function BookingThumbnail({url,name}:{url?:string;name:string}){
  const [failed,setFailed]=useState(false);
  return <Thumbnail>{url&&!failed?<img src={url} alt={'Fotografie: '+name} loading="lazy" onError={()=>setFailed(true)}/>:<Shirt aria-label="Fotografie není k dispozici" size={24}/>}</Thumbnail>;
}
const ItemHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${t.space[2]};
  min-inline-size: 0;
  > h3 { min-inline-size: 0; align-self: center; }
`;
const SectionHeader = styled.div`
  display:flex;align-items:center;justify-content:space-between;gap:${t.space[3]};
`;
const DateFields = styled.div`
  display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:${t.space[3]};
  input {min-inline-size:0;inline-size:100%;}
`;
const AvailabilityActions = styled.div`
  display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:${t.space[3]};
  > p {flex:1;min-inline-size:140px;font-size:${t.type.bodySm.size};font-weight:600;}
`;
const PriceFacts = styled(Facts)`
  > div { display: grid; grid-template-columns: minmax(0, 1fr) max-content; }
  dd { white-space: nowrap; }
`;
export function PriceSummary({ pricing, discount, delivery=0 }: { delivery?:number; pricing: Pricing; discount?: {number: string; amount: number} }) {
  return (
    <PriceFacts>
      <RentalPriceRows rentalPrice={pricing.rentalPrice} discount={discount} />
      {delivery > 0 ? <div><dt>Doprava</dt><dd>{formatMoney(delivery)}</dd></div> : null}
      {pricing.deposit > 0 ? <div>
        <dt>Vratná kauce</dt>
        <dd>{formatMoney(pricing.deposit)}</dd>
      </div> : null}
      <div>
        <dt>Celkem k úhradě</dt>
        <dd>{formatMoney(pricing.totalDue + delivery)}</dd>
      </div>
    </PriceFacts>
  );
}
const formatInstant = (value: string) =>
  new Intl.DateTimeFormat('cs-CZ', {
    timeZone: 'Europe/Prague',
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
export function BookingPage() {
  const {cooperationActive, loading: settingsLoading, error: settingsError, reload: reloadSettings}=useSiteSettings();
  const booking = useBooking(),
    navigate = useNavigate(),
    location = useLocation(),
    draft = booking.draft;
  const receiptKey=booking.stored?.kind==='receipt' ? booking.stored.receipt.reservationNumber+':'+(booking.discountAuthToken??'guest') : null;
  useLiveReservation(receiptKey,booking.refreshStatus);
  const receiptReady=booking.receiptVerified && !booking.busy && !booking.error;
  const catalogueReturnTo = getCatalogueReturnTo(location.state, draft?.product.category);
  const policy = usePublicRead(
    booking.stored ? null : 'booking-policy',
    getBookingPolicy
  );
  const [fittingDiscount,setFittingDiscount]=useState<FittingDiscountSelection>();
  useEffect(()=>{if(draft?.selection.rentalMode!=='studio')setFittingDiscount(undefined);},[draft?.selection.rentalMode]);
  useEffect(()=>{
    if(cooperationActive===false && draft?.selection.rentalMode==='studio' && !booking.stored){
      booking.updateDraft({...draft,selection:{...draft.selection,rentalMode:'external'}});
      setRequested(null);
    }
  },[cooperationActive,draft,booking]);
  const [requested, setRequested] = useState<Selection[] | null>(null),
    [itemValidation, setItemValidation] = useState<Record<string, string>>({}),
    [selectionValidation, setSelectionValidation] = useState<
      ReturnType<typeof selectionErrors>
    >({}),
    [contactValidation, setContactValidation] = useState<
      ReturnType<typeof contactErrors>
    >({});
  const root = useRef<HTMLDivElement>(null),
    notice = useRef<HTMLDivElement>(null),
    title = useRef<HTMLHeadingElement>(null);
  const key =
    requested &&
    draft &&
    requested.length === draftSelections(draft).length &&
    requested.every((selection, index) => sameSelection(selection, draftSelections(draft)[index])) &&
    !booking.stored &&
    !booking.error
      ? JSON.stringify(requested)
      : null;
  const availability = usePublicRead(key, async signal => {
    const items = discountQuotes(await Promise.all(requested!.map(selection => getAvailability(selection, signal))));
    trackAvailability(items.every(item => item.available));
    return { ...items[0], items, available: items.every(item => item.available),
      pricing: items.reduce((sum, item) => ({
        rentalPrice: sum.rentalPrice + item.pricing.rentalPrice,
        deposit: sum.deposit + item.pricing.deposit, totalDue: sum.totalDue + item.pricing.totalDue,
      }), { rentalPrice: 0, deposit: 0, totalDue: 0 }) };
  });
  const quote = availability.data,
    variant = draft?.product.variants.find(
      v => v.id === draft.selection.variantId
    );
  const previousEntry = useRef<string | null>(null);
  const view = booking.storageBlocked
    ? 'storage'
    : booking.busy
      ? 'pending'
      : (booking.stored?.kind ?? (booking.error ? 'error' : 'draft'));
  useLayoutEffect(() => {
    if (!booking.stored && (settingsLoading || settingsError)) return;
    if (previousEntry.current === location.key) return;
    previousEntry.current = location.key;
    if (view === 'draft') {
      title.current?.focus({ preventScroll: true });
      window.scrollTo(0, 0);
    }
  }, [location.key, view, booking.stored, settingsLoading, settingsError]);
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (view === 'attempt' || view === 'storage' || view === 'error')
        notice.current?.focus();
      else if (view === 'receipt') title.current?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [view]);
  const focusField = (field: string) =>
    root.current?.querySelector<HTMLElement>(`[name="${field}"]`)?.focus();
  const changeSelection = (field: keyof Selection, value: string) => {
    if (!draft) return;
    setRequested(null);
    setSelectionValidation({});
    setItemValidation({});
    booking.updateDraft({…8381 tokens truncated…ní vám předáme před expedicí. Neodesílejte balík na sídlo společnosti bez domluvy.</Copy>
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
