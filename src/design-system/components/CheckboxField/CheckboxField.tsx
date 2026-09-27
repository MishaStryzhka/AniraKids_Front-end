import { forwardRef, useId, type InputHTMLAttributes } from 'react';
import styled from 'styled-components';
import { designTokens as t } from '../../tokens/designTokens';

export interface CheckboxFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>,'type'>{label:string;error?:boolean}

const Label=styled.label<{$disabled:boolean}>`
  min-block-size:44px;
  display:inline-flex;
  align-items:center;
  gap:${t.space[3]};
  font-family:${t.font.family.ui};
  font-size:${t.type.bodyMd.size};
  color:${({$disabled})=>$disabled?t.color.state.disabled.fg:'inherit'};
  cursor:${({$disabled})=>$disabled?'not-allowed':'pointer'};
`;

const Box=styled.input<{$error:boolean;$disabled:boolean}>`
  inline-size:20px;
  block-size:20px;
  margin:0;
  accent-color:${t.color.action.primary.bg};
  appearance:none;
  border:1px solid ${({$error,$disabled})=>$disabled?t.color.state.disabled.border:$error?t.color.status.danger.fg:t.color.border.default};
  border-radius:${t.radius[1]};
  background:${({$disabled})=>$disabled?t.color.state.disabled.bg:t.color.bg.surface};
  display:grid;
  place-content:center;

  &::before{
    content:'';
    inline-size:10px;
    block-size:10px;
    transform:scale(0);
    background:currentColor;
    clip-path:polygon(14% 44%,0 59%,40% 100%,100% 18%,84% 4%,39% 70%);
  }

  &:checked{
    background:${({$disabled})=>$disabled?t.color.state.disabled.bg:t.color.action.primary.bg};
    border-color:${({$error,$disabled})=>$disabled?t.color.state.disabled.border:$error?t.color.status.danger.fg:t.color.action.primary.bg};
    color:${({$disabled})=>$disabled?t.color.state.disabled.fg:t.color.action.primary.fg};
  }

  &:checked::before{transform:scale(1);}

  &:focus-visible{
    outline:${t.focus.ring.width} solid ${t.color.focus.ring};
    outline-offset:${t.focus.ring.offset};
  }

  &:disabled{cursor:not-allowed;}
`;

export const CheckboxField=forwardRef<HTMLInputElement,CheckboxFieldProps>(function CheckboxField({label,error=false,id,disabled=false,'aria-invalid':invalid,...props},ref){
  const generated=useId();
  const fieldId=id??`checkbox-${generated.replace(/:/g,'')}`;
  return <Label htmlFor={fieldId} $disabled={disabled}><Box {...props} ref={ref} id={fieldId} type="checkbox" disabled={disabled} $error={error} $disabled={disabled} aria-invalid={invalid??(error||undefined)}/><span>{label}</span></Label>
});
