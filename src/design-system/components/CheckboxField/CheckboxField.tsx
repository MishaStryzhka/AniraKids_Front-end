import { forwardRef, useId, type InputHTMLAttributes } from 'react';
import styled from 'styled-components';
import { designTokens as t } from '../../tokens/designTokens';
export interface CheckboxFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>,'type'>{label:string;error?:boolean}
const Label=styled.label`min-block-size:44px;display:inline-flex;align-items:center;gap:${t.space[3]};font-family:${t.font.family.ui};font-size:${t.type.bodyMd.size};cursor:pointer;`;
const Box=styled.input`inline-size:20px;block-size:20px;margin:0;accent-color:${t.color.action.primary.bg};&:focus-visible{outline:${t.focus.ring.width} solid ${t.color.focus.ring};outline-offset:${t.focus.ring.offset};}`;
export const CheckboxField=forwardRef<HTMLInputElement,CheckboxFieldProps>(function CheckboxField({label,error=false,id,'aria-invalid':invalid,...props},ref){const generated=useId();const fieldId=id??`checkbox-${generated.replace(/:/g,'')}`;return <Label htmlFor={fieldId}><Box {...props} ref={ref} id={fieldId} type="checkbox" aria-invalid={invalid??(error||undefined)}/><span>{label}</span></Label>});