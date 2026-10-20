import {useEffect,useRef,useState} from 'react';
import styled from 'styled-components';
import {Button} from '../design-system/components/Button';
import {Input} from '../design-system/components/Input';
import {SelectField} from '../design-system/components/SelectField';
import {designTokens as t} from '../design-system/tokens/designTokens';
import {partnerApi,PartnerApiError} from './api';
import {adminBookingApi} from '../admin/bookings/adminBookingApi';
import {getAvailability} from '../storefront/api/publicApi';
import {discountQuotes} from './discount';
import {fittingApi,type Slots} from '../fittings/fittingApi';
import {pragueToday} from '../admin/calendar/calendarDates';
const formatMoney=(amount:number)=>new Intl.NumberFormat('cs-CZ',{style:'currency',currency:'CZK',maximumFractionDigits:0}).format(amount);
const Card = styled.section`
  border: 1px solid ${t.color.border.subtle};
  border-radius: 14px;
  background: ${t.color.bg.surface};
  padding: 20px;
  display: grid;
  gap: 14px;
  min-width: 0;
  overflow-wrap: anywhere;
`;
const Row = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
  > img {
    width: 60px;
    height: 80px;
    object-fit: cover;
    border-radius: 8px;
  }
`;
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  min-width: 0;
`;
const Form = styled.form`
  display: grid;
  gap: 16px;
  fieldset {
    border: 0;
    padding: 0;
    margin: 0;
    display: grid;
    gap: 16px;
    min-width: 0;
  }
`;
export function NewReservation({ catalogue, token, userId, onDone, scope='partner', onBusyChange }: any) {
  const storageKey = 'anirak.'+scope+'-attempt.v1.' + userId;
  const [saved] = useState(() => {
    try {
      const value = JSON.parse(sessionStorage.getItem(storageKey) || 'null');
      return value &&
        typeof value.key === 'string' &&
        Array.isArray(value.body?.items)
        ? value
        : null;
    } catch {
      return null;
    }
  });
  const [product, setProduct] = useState(''),
    [variant, setVariant] = useState(''),
    [items, setItems] = useState<any[]>(saved?.body.items || []),
    [mode, setMode] = useState(saved?.body.rentalMode || 'studio'),
    [start, setStart] = useState(saved?.body.startDate || pragueToday()),
    [end, setEnd] = useState(saved?.body.endDate || pragueToday()),
    [contact, setContact] = useState(
      saved?.body.customer || {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
      }
    ),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const attempt = useRef<{ key: string; body: any } | null>(saved);
  const [quote, setQuote] = useState<{
    signature: string;
    total: number;
    deposit: number;
  } | null>(null);
  const selected = catalogue.find((p: any) => p.id === product);
  useEffect(()=>{onBusyChange?.(busy);},[busy,onBusyChange]);
  async function submit() {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const body = {
        items,
        rentalMode: mode,
        startDate: start,
        endDate: mode === 'studio' ? start : end,
        customer: contact,
      };
      const signature = JSON.stringify(body);
      if (!attempt.current && quote?.signature !== signature) {
        const quotes = discountQuotes(
          await Promise.all(
            items.map(item =>
              getAvailability({
                ...item,
                rentalMode: mode as 'studio' | 'external',
                startDate: start,
                endDate: body.endDate,
              })
            )
          )
        );
        if (quotes.some(q => !q.available))
          throw new Error(
            'Některé oblečení není dostupné. Vyberte jiný termín.'
          );
        setQuote({
          signature,
          total: quotes.reduce((s, q) => s + q.pricing.rentalPrice, 0),
          deposit: quotes.reduce((s, q) => s + q.pricing.deposit, 0),
        });
        return;
      }
      if (!attempt.current)
        attempt.current = { key: crypto.randomUUID(), body };
      sessionStorage.setItem(storageKey, JSON.stringify(attempt.current));
      const result = await (scope==='admin'?adminBookingApi:partnerApi)(
        'create-reservation',
        token,
        attempt.current.body,
        attempt.current.key
      );
      sessionStorage.removeItem(storageKey);
      onDone(result);
    } catch (e) {
      if (e instanceof PartnerApiError && [400, 404, 409].includes(e.status)) {
        attempt.current = null;
        sessionStorage.removeItem(storageKey);
        setQuote(null);
      }
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Form
      onSubmit={e => {
        e.preventDefault();
        void submit();
      }}
    >
      <fieldset disabled={busy || !!attempt.current}>
        <Grid>
          <SelectField
            label="Produkt"
            value={product}
            onChange={e => {
              setProduct(e.target.value);
              setVariant('');
            }}
          >
            <option value="">Vyberte produkt</option>
            {catalogue.map((p: any) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </SelectField>
          <SelectField
            label="Velikost"
            value={variant}
            onChange={e => setVariant(e.target.value)}
          >
            <option value="">Vyberte velikost</option>
            {selected?.variants.map((v: any) => (
              <option key={v.id} value={v.id}>
                {v.size}
              </option>
            ))}
          </SelectField>
        </Grid>
        <Button
          type="button"
          variant="secondary"
          disabled={!variant || items.length >= 20}
          onClick={() =>
            setItems([...items, { productId: product, variantId: variant }])
          }
        >
          Přidat oblečení
        </Button>
        {items.map((i, index) => (
          <Row key={index}>
            <span>
              {catalogue.find((p: any) => p.id === i.productId)?.name} ·{' '}
              {
                catalogue
                  .find((p: any) => p.id === i.productId)
                  ?.variants.find((v: any) => v.id === i.variantId)?.size
              }
            </span>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setItems(items.filter((_, n) => n !== index))}
            >
              Odebrat
            </Button>
          </Row>
        ))}
        <SelectField
          label="Způsob pronájmu"
          value={mode}
          onChange={e => setMode(e.target.value)}
        >
          <option value="studio">Studio</option>
          <option value="external">Mimo studio</option>
        </SelectField>
        <Grid>
          <Input
            label="Datum od"
            type="date"
            min={pragueToday()}
            required
            value={start}
            onChange={e => {
              setStart(e.target.value);
              if (end < e.target.value) setEnd(e.target.value);
            }}
          />
          {mode === 'external' ? (
            <Input
              label="Datum do"
              type="date"
              min={start}
              required
              value={end}
              onChange={e => setEnd(e.target.value)}
            />
          ) : null}
          {Object.entries({
            firstName: 'Jméno',
            lastName: 'Příjmení',
            email: 'E-mail',
            phone: 'Telefon',
          }).map(([key, label]) => (
            <Input
              key={key}
              label={label}
              type={key === 'email' ? 'email' : 'text'}
              required
              value={(contact as any)[key]}
              onChange={e => setContact({ ...contact, [key]: e.target.value })}
            />
          ))}
        </Grid>
      </fieldset>
      <p>Rezervace oblečení nepotvrzuje rezervaci fotografického studia.</p>
      {quote ? (
        <Card>
          <p>
            Cena pronájmu po slevě: <strong>{formatMoney(quote.total)}</strong>
          </p>
          {quote.deposit > 0 ? (
            <p>Vratná kauce: {formatMoney(quote.deposit)}</p>
          ) : null}
          <p>
            Nejdražší šaty za plnou cenu, každé další se slevou 20 %. Po změně
            výběru cenu znovu ověříme.
          </p>
        </Card>
      ) : null}
      {error ? <p role="alert">{error}</p> : null}
      <Button type="submit" disabled={busy || !items.length}>
        {busy
          ? 'Odesílání…'
          : attempt.current
            ? 'Ověřit vytvoření rezervace'
            : quote
              ? 'Potvrdit a vytvořit rezervaci'
              : 'Ověřit dostupnost a cenu'}
      </Button>
    </Form>
  );
}

export function NewFitting({ token, userId, onDone, scope='partner', onBusyChange }: any) {
  const key = 'anirak.'+scope+'-fitting.v1.' + userId;
  const [saved] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(key) || 'null');
    } catch {
      return null;
    }
  });
  const [date, setDate] = useState(saved?.date || pragueToday()),
    [time, setTime] = useState(saved?.time || ''),
    [name, setName] = useState(saved?.name || ''),
    [email, setEmail] = useState(saved?.email || ''),
    [phone, setPhone] = useState(saved?.phone || ''),
    [slots, setSlots] = useState<Slots | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const attempt = useRef<any>(saved);
  useEffect(() => {
    const controller = new AbortController();
    setSlots(null);
    fittingApi<Slots>('/fittings/slots?date=' + date, {
      signal: controller.signal,
    })
      .then(setSlots)
      .catch(e => {
        if (!controller.signal.aborted) setError(e.message);
      });
    return () => controller.abort();
  }, [date]);
  useEffect(()=>{onBusyChange?.(busy);},[busy,onBusyChange]);
  async function submit() {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      if (!attempt.current)
        attempt.current = {
          operationId: crypto.randomUUID(),
          token: Array.from(crypto.getRandomValues(new Uint8Array(32)), n =>
            n.toString(16).padStart(2, '0')
          ).join(''),
          date,
          time,
          name,
          email,
          phone,
        };
      sessionStorage.setItem(key, JSON.stringify(attempt.current));
      const result = await (scope==='admin'?adminBookingApi:partnerApi)('create-fitting', token, attempt.current);
      sessionStorage.removeItem(key);
      onDone(result);
    } catch (e) {
      if (e instanceof PartnerApiError && [400, 404, 409].includes(e.status)) {
        attempt.current = null;
        sessionStorage.removeItem(key);
      }
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Form
      onSubmit={e => {
        e.preventDefault();
        void submit();
      }}
    >
      <fieldset disabled={busy || !!attempt.current}>
        <Input
          label="Datum zkoušky"
          type="date"
          min={pragueToday()}
          required
          value={date}
          onChange={e => {
            setDate(e.target.value);
            setTime('');
          }}
        />
        <SelectField
          label="Volný čas"
          value={time}
          required
          onChange={e => setTime(e.target.value)}
        >
          <option value="">Vyberte čas</option>
          {slots?.slots.map(s => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </SelectField>
        {slots && !slots.slots.length ? (
          <p>Pro tento den nejsou dostupné časy.</p>
        ) : null}
        <Input
          label="Jméno a příjmení klienta"
          required
          minLength={2}
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <Input
          label="E-mail klienta"
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <Input
          label="Telefon klienta"
          required
          minLength={5}
          value={phone}
          onChange={e => setPhone(e.target.value)}
        />
      </fieldset>
      <p>
        30 minut · 200 Kč na účet ANIRAK. Termín potvrdí ANIRAK po ověření
        platby.
      </p>
      {error ? <p role="alert">{error}</p> : null}
      <Button type="submit" disabled={busy || !time}>
        {busy
          ? 'Odesílání…'
          : attempt.current
            ? 'Ověřit vytvoření zkoušky'
            : 'Rezervovat zkoušku'}
      </Button>
    </Form>
  );
}
