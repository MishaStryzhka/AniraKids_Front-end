import {fireEvent,render,screen} from '@testing-library/react';
import {CheckboxField} from './CheckboxField';
import {designTokens as t} from '../../tokens/designTokens';

const injectedCss=()=>Array.from(document.head.querySelectorAll('style')).map(style=>style.textContent??'').join('\n');

test('uses a native checkbox with label association and >=44px labelled target',()=>{
  render(<CheckboxField label="Pronájem" id="rental" defaultChecked/>);
  const el=screen.getByLabelText('Pronájem');
  const label=screen.getByText('Pronájem').closest('label')!;
  expect(el).toHaveAttribute('type','checkbox');
  expect(el).toHaveAttribute('id','rental');
  expect(label).toHaveAttribute('for','rental');
  expect(el).toBeChecked();
  expect(injectedCss()).toContain('min-block-size:44px');
});

test('error keeps aria semantics and applies danger border independently from focus ring',()=>{
  render(<CheckboxField label="Příležitost" error aria-describedby="occasion-error"/>);
  const el=screen.getByLabelText('Příležitost');
  const css=injectedCss();
  expect(el).toHaveAttribute('aria-invalid','true');
  expect(el).toHaveAttribute('aria-describedby','occasion-error');
  expect(css).toContain(`border:1px solid ${t.color.status.danger.fg}`);
  expect(css).toContain(`outline:${t.focus.ring.width} solid ${t.color.focus.ring}`);
  expect(css).toContain(`outline-offset:${t.focus.ring.offset}`);
});

test('disabled uses DS disabled visuals, communicates cursor state and blocks interaction',()=>{
  const onChange=jest.fn();
  render(<CheckboxField label="Prodej" disabled onChange={onChange}/>);
  const el=screen.getByLabelText('Prodej');
  const css=injectedCss();
  expect(el).toBeDisabled();
  expect(css).toContain(`background:${t.color.state.disabled.bg}`);
  expect(css).toContain(`border:1px solid ${t.color.state.disabled.border}`);
  expect(css).toContain(`color:${t.color.state.disabled.fg}`);
  expect(css).toContain('cursor:not-allowed');
  fireEvent.click(screen.getByText('Prodej'));
  expect(el).not.toBeChecked();
  expect(onChange).not.toHaveBeenCalled();
});

test('enabled label click preserves native checkbox interaction',()=>{
  render(<CheckboxField label="Pronájem"/>);
  const el=screen.getByLabelText('Pronájem');
  fireEvent.click(screen.getByText('Pronájem'));
  expect(el).toBeChecked();
});
