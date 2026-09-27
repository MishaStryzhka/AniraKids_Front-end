import { forwardRef, useId, type TextareaHTMLAttributes } from 'react';
import styled from 'styled-components';
import { designTokens as t } from '../../tokens/designTokens';

export interface TextareaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: boolean;
}
const Field=styled.div`display:grid;gap:${t.space[2]};min-inline-size:0;font-family:${t.font.family.ui};`;
const Label=styled.label`font-size:${t.type.label.size};line-height:${t.type.label.lineHeight};font-weight:${t.type.label.weight};`;
const Textarea=styled.textarea<{ $error:boolean }>`
 inline-size:100%;min-inline-size:0;min-block-size:120px;padding:${t.space[3]} ${t.component.input.paddingInline};
 border:1px solid ${({$error})=>$error?t.color.status.danger.fg:t.color.border.default};border-radius:${t.component.input.radius};
 background:${t.color.bg.surface};color:${t.color.text.primary};font:inherit;resize:vertical;
 &:focus-visible{outline:${t.focus.ring.width} solid ${t.color.focus.ring};outline-offset:${t.focus.ring.offset};}
 &:disabled{color:${t.color.state.disabled.fg};background:${t.color.state.disabled.bg};border-color:${t.color.state.disabled.border};}
`;
export const TextareaField=forwardRef<HTMLTextAreaElement,TextareaFieldProps>(function TextareaField({label,error=false,id,className,'aria-invalid':invalid,...props},ref){
 const generated=useId(); const fieldId=id??`textarea-${generated.replace(/:/g,'')}`;
 return <Field className={className}><Label htmlFor={fieldId}>{label}</Label><Textarea ref={ref} id={fieldId} $error={error} aria-invalid={invalid??(error||undefined)} {...props}/></Field>;
});