import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import styled from 'styled-components';
import { designTokens as t } from '../../tokens/designTokens';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hideLabel?: boolean;
  error?: boolean;
  leadingIcon?: ReactNode;
  trailingAction?: ReactNode;
}

const Field = styled.div`
  display: grid;
  gap: ${t.space[2]};
  min-inline-size: 0;
  font-family: ${t.font.family.ui};
  color: ${t.color.text.primary};
`;

const Label = styled.label<{ $hidden: boolean }>`
  font-size: ${t.type.label.size};
  line-height: ${t.type.label.lineHeight};
  font-weight: ${t.type.label.weight};
  letter-spacing: ${t.type.label.letterSpacing};
  ${({ $hidden }) => $hidden ? 'position:absolute;inline-size:1px;block-size:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;' : ''}
`;

const Shell = styled.div<{ $error: boolean; $disabled: boolean }>`
  block-size: ${t.component.input.height};
  min-inline-size: 0;
  padding-inline: ${t.component.input.paddingInline};
  border: 1px solid ${({ $error, $disabled }) => $error ? t.color.status.danger.fg : $disabled ? t.color.state.disabled.border : t.color.border.default};
  border-radius: ${t.component.input.radius};
  display: flex;
  align-items: center;
  gap: ${t.space[2]};
  color: ${({ $disabled }) => $disabled ? t.color.state.disabled.fg : t.color.text.primary};
  background: ${({ $disabled }) => $disabled ? t.color.state.disabled.bg : t.color.bg.surface};
  transition: border-color ${t.motion.fast} ease;

  @media (hover: hover) {
    &:hover { border-color: ${({ $error, $disabled }) => !$disabled && ($error ? t.color.status.danger.fg : t.color.border.strong)}; }
  }

  &:focus-within {
    border-color: ${({ $error }) => $error ? t.color.status.danger.fg : t.color.border.strong};
  }

  &:has(input:focus-visible) {
    outline: ${t.focus.ring.width} solid ${t.color.focus.ring};
    outline-offset: ${t.focus.ring.offset};
  }

  & > svg {
    inline-size: ${t.component.input.iconSize};
    block-size: ${t.component.input.iconSize};
    flex: 0 0 auto;
    stroke-width: ${t.icon.strokeWidth};
  }
`;

const NativeInput = styled.input`
  inline-size: 100%;
  min-inline-size: 0;
  border: 0;
  outline: 0;
  padding: 0;
  background: transparent;
  color: inherit;
  font-family: ${t.font.family.ui};
  font-size: ${t.type.input.size};
  line-height: ${t.type.input.lineHeight};
  font-weight: ${t.type.input.weight};
  letter-spacing: ${t.type.input.letterSpacing};

  &::placeholder { color: ${t.color.text.muted}; }
`;

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    hideLabel = false,
    error = false,
    leadingIcon,
    trailingAction,
    disabled = false,
    className,
    id,
    'aria-invalid': ariaInvalid,
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? `input-${generatedId.replace(/:/g, '')}`;

  return (
    <Field className={className}>
      <Label htmlFor={inputId} $hidden={hideLabel}>{label}</Label>
      <Shell $error={error} $disabled={Boolean(disabled)}>
        {leadingIcon}
        <NativeInput
          ref={ref}
          id={inputId}
          disabled={disabled}
          aria-invalid={ariaInvalid ?? (error || undefined)}
          {...props}
        />
        {trailingAction}
      </Shell>
    </Field>
  );
});
