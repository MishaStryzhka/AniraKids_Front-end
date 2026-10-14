import { useId, useRef } from 'react';
import styled from 'styled-components';
import { Button } from '../../design-system/components/Button';
import { designTokens as t } from '../../design-system/tokens/designTokens';
import { LETTER_SIZES, inferFitSizes, normalizeFitSizes } from './variantFitSizes';

const Field = styled.div`
  display: grid;
  gap: ${t.space[2]};
  min-inline-size: 0;
  label { font-weight: 600; }
  select { width: 100%; min-height: 44px; padding: 10px 12px; border: 1px solid ${t.color.border.subtle}; border-radius: ${t.radius[2]}; background: ${t.color.bg.surface}; color: ${t.color.text.primary}; font: inherit; }
  select:focus-visible { outline: 2px solid ${t.color.focus.ring}; outline-offset: 2px; }
  p { margin: 0; font-size: 13px; line-height: 20px; color: ${t.color.text.secondary}; }
`;
const Chips = styled.div`display: flex; flex-wrap: wrap; gap: ${t.space[2]};`;
const childrenSizes = Array.from({length: 23}, (_, i) => String(50 + i * 6));
const adultSizes = Array.from({length: 15}, (_, i) => String(32 + i * 2));
const letterSizes = [...LETTER_SIZES, 'UNI'];
const known = new Set([...childrenSizes, ...adultSizes, ...letterSizes]);

export function VariantFitSizesField({value, size, disabled, onChange}: {
  value: string[]; size: string; disabled: boolean; onChange(value: string[] | null): void;
}) {
  const id = useId();
  const selectRef = useRef<HTMLSelectElement>(null);
  const inferred = size.trim() ? inferFitSizes(size) : [];
  const extra = inferred.filter(item => !known.has(item));
  const options = (items: string[]) => items.map(item => <option key={item} value={item} disabled={value.includes(item)}>{item}</option>);
  return <Field>
    <label htmlFor={id}>Vhodné pro velikosti</label>
    <Chips role="group" aria-label="Vybrané velikosti pro filtrování">
      {value.map(item => <Button key={item} variant="secondary" disabled={disabled}
        aria-label={`Odebrat velikost ${item}`} onClick={() => { onChange(value.filter(size => size !== item)); selectRef.current?.focus(); }}>{item} <span aria-hidden="true">×</span></Button>)}
    </Chips>
    <select ref={selectRef} id={id} value="" disabled={disabled} aria-describedby={`${id}-help`} onChange={event => {
      if (event.target.value) onChange(normalizeFitSizes([...value, event.target.value]));
    }}>
      <option value="">Přidat velikost…</option>
      <optgroup label="Dětské velikosti">{options(childrenSizes)}</optgroup>
      <optgroup label="Číselné velikosti pro dospělé">{options(adultSizes)}</optgroup>
      <optgroup label="Písmenné velikosti">{options(letterSizes)}</optgroup>
      {extra.length > 0 ? <optgroup label="Z názvu velikosti">{options(extra)}</optgroup> : null}
    </select>
    <p id={`${id}-help`}>Vyberte všechny velikosti, kterým tento kus sedí. Například XS–M zahrnuje XS, S a M. Výběr slouží pro filtr v katalogu.</p>
    <div><Button variant="secondary" disabled={disabled || !size.trim()} onClick={() => onChange(null)}>Doplnit podle názvu velikosti</Button></div>
  </Field>;
}
