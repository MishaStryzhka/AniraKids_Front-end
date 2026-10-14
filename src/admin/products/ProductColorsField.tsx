import { ColorPalette, PRODUCT_COLOR_OPTIONS } from '../../design-system/components/ColorPalette/ColorPalette';
import { useId, useRef, type ReactNode } from 'react';
import styled from 'styled-components';
import { Button } from '../../design-system/components/Button';
import { SelectField } from '../../design-system/components/SelectField';
import { designTokens as t } from '../../design-system/tokens/designTokens';

const colors = PRODUCT_COLOR_OPTIONS;
export const parseColors = (value: string): string[] => Array.from(new Set(value.split(',').map(part => part.trim().toLowerCase()).filter(Boolean))).map(part => part.charAt(0).toUpperCase() + part.slice(1));
const Root = styled.div`display:grid;gap:${t.space[2]};min-inline-size:0;p{margin:0;font-size:13px;line-height:20px;color:${t.color.text.secondary};}`;
const Chips = styled.div`display:flex;flex-wrap:wrap;gap:${t.space[2]};button{max-inline-size:100%;min-height:44px;white-space:normal;overflow-wrap:anywhere;}`;

export function ProductColorsField({value, disabled, onChange, children}: {value:string;disabled:boolean;onChange(value:string):void;children?:ReactNode}) {
  const selected = parseColors(value);
  const ref = useRef<HTMLSelectElement>(null);
  const id = useId();
  return <Root>
    <ColorPalette label="Paleta barev produktu" colors={colors} selected={selected} disabled={disabled}
      isDisabled={color=>!selected.includes(color)&&[...selected,color].join(', ').length>80}
      onToggle={color=>onChange((selected.includes(color)?selected.filter(item=>item!==color):[...selected,color]).join(', '))}/>

    {children}
    <Chips role="group" aria-label="Vybrané barvy">
      {selected.map(color => <Button type="button" key={color} variant="secondary" disabled={disabled} aria-label={`Odebrat barvu ${color}`} onClick={() => {onChange(selected.filter(item => item !== color).join(', ')); ref.current?.focus();}}>{color} <span aria-hidden="true">×</span></Button>)}
    </Chips>
    <SelectField ref={ref} label="Přidat barvu" value="" disabled={disabled} aria-describedby={id} onChange={event => {if(event.target.value) onChange([...selected,event.target.value].join(', '));}}>
      <option value="">Vyberte barvu…</option>
      {colors.map(color => <option key={color} value={color} disabled={selected.includes(color) || [...selected,color].join(', ').length > 80}>{color}</option>)}
    </SelectField>
    <p id={id}>Vyberte všechny barvy šatů. Vlastní barvy můžete napsat do pole Barva a oddělit čárkou. Každá barva se ve filtru zobrazí samostatně.</p>
  </Root>;
}
