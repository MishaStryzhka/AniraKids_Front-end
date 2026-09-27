import {fireEvent,render,screen} from '@testing-library/react';
import {CheckboxField} from './CheckboxField';
import {designTokens as t} from '../../tokens/designTokens';

test('uses a native checkbox with label association and >=44px labelled target',()=>{
  render(<CheckboxField label="Pronájem" id="rental" defaultChecked/>);
  const el=screen.getByLabelText('Pronájem');
  expect(el).toHaveAttribute('type','checkbox');
  expect(el).toHaveAttribute('id','rental');
  expect(screen.getByText('Pronájem').closest('label')).toHaveAttribute('for','rental');
  expect(el).toBeChecked();
  expect(screen.getByText('Pronájem').closest('label')).toHaveStyleRule('min-block-size','44px');
});

test('error keeps aria semantics and applies danger border independently from focus ring',()=>{
  render(<CheckboxField label="Příležitost" error aria-describedby="occasion-error"/>);
  const el=screen.getByLabelText('Příležitost');
  expect(el).toHaveAttribute('aria-invalid','true');
  expect(el).toHaveAttribute('aria-describedby','occasion-error');
  expect(el).toHaveStyleRule('border',`1px solid ${t.color.status.danger.fg}`);
  expect(el).toHaveStyleRule('outline',`${t.focus.ring.width} solid ${t.color.focus.ring}`,{modifier:':focus-visible'});
  expect(el).toHaveStyleRule('outline-offset',t.focus.ring.offset,{modifier:':focus-visible'});
});

test('disabled uses DS disabled visuals, communicates cursor state and blocks interaction',()=>{
  const onChange=jest.fn();
  render(<CheckboxField label="Prodej" disabled onChange={onChange}/>);
  const el=screen.getByLabelText('Prodej');
  const label=screen.getByText('Prodej').closest('label');
  expect(el).toBeDisabled();
  expect(el).toHaveStyleRule('background',t.color.state.disabled.bg);
  expect(el).toHaveStyleRule('border',`1px solid ${t.color.state.disabled.border}`);
  expect(label).toHaveStyleRule('color',t.color.state.disabled.fg);
  expect(label).toHaveStyleRule('cursor','not-allowed');
  fireEvent.click(label!);
  expect(el).not.toBeChecked();
  expect(onChange).not.toHaveBeenCalled();
});

test('enabled label click preserves native checkbox interaction',()=>{
  render(<CheckboxField label="Pronájem"/>);
  const el=screen.getByLabelText('Pronájem');
  fireEvent.click(screen.getByText('Pronájem'));
  expect(el).toBeChecked();
});
