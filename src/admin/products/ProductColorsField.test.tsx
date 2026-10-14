import { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { ProductColorsField, parseColors } from './ProductColorsField';

test('normalizes Czech colors without splitting shade names', () => {
  expect(parseColors(' Bílá, bílá, ČERVENÁ, světle růžová, ')).toEqual(['Bílá','Červená','Světle růžová']);
});
function Form() {
  const [value,setValue] = useState('Bílá, světle růžová');
  return <><ProductColorsField value={value} disabled={false} onChange={setValue}/><output>{value}</output></>;
}
test('adds and removes colors in the existing save field and restores focus', () => {
  render(<Form/>);
  expect(screen.getByRole('button',{name:'Šampaňská',exact:true})).toBeInTheDocument();
  expect(screen.getByRole('button',{name:'Smaragdová',exact:true})).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Přidat barvu'), {target:{value:'Červená'}});
  expect(screen.getByRole('status')).toHaveTextContent('Bílá, Světle růžová, Červená');
  expect(screen.getByRole('option',{name:'Bílá'})).toBeDisabled();
  fireEvent.click(screen.getByRole('button',{name:'Odebrat barvu Bílá'}));
  expect(screen.getByRole('status')).toHaveTextContent('Světle růžová, Červená');
  expect(screen.getByLabelText('Přidat barvu')).toHaveFocus();
});
