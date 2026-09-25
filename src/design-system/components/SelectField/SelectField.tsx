import { forwardRef, useId, type SelectHTMLAttributes } from 'react';
import styled from 'styled-components';
import { designTokens as t } from '../../tokens/designTokens';

export interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
}

const Field = styled.div`
  display: grid;
  gap: ${t.space[1]};
  min-inline-size: 0;
  font-family: ${t.font.family.ui};
  color: ${t.color.text.primary};
`;

const Label = styled.label`
  font-size: ${t.type.label.size};
  line-height: ${t.type.label.lineHeight};
  font-weight: ${t.type.label.weight};
  letter-spacing: ${t.type.label.letterSpacing};
`;

const NativeSelect = styled.select`
  inline-size: 100%;
  min-inline-size: 0;
  block-size: ${t.component.input.height};
  padding-inline: ${t.component.input.paddingInline};
  border: 1px solid ${t.color.border.default};
  border-radius: ${t.component.input.radius};
  background: ${t.color.bg.surface};
  color: ${t.color.text.primary};
  font-family: ${t.font.family.ui};
  font-size: ${t.type.input.size};
  line-height: ${t.type.input.lineHeight};
  font-weight: ${t.type.input.weight};
  letter-spacing: ${t.type.input.letterSpacing};
  transition: border-color ${t.motion.fast} ease;

  @media (hover: hover) {
    &:hover:not(:disabled) { border-color: ${t.color.border.strong}; }
  }

  &:focus-visible {
    border-color: ${t.color.border.strong};
    outline: ${t.focus.ring.width} solid ${t.color.focus.ring};
    outline-offset: ${t.focus.ring.offset};
  }

  &:disabled {
    color: ${t.color.state.disabled.fg};
    background: ${t.color.state.disabled.bg};
    border-color: ${t.color.state.disabled.border};
  }
`;

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  function SelectField({ label, className, id, ...props }, ref) {
    const generatedId = useId();
    const selectId = id ?? `select-${generatedId.replace(/:/g, '')}`;

    return (
      <Field className={className}>
        <Label htmlFor={selectId}>{label}</Label>
        <NativeSelect ref={ref} id={selectId} {...props} />
      </Field>
    );
  }
);
