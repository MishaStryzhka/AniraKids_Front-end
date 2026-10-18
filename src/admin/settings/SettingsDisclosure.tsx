import type {ReactNode} from 'react';
import styled from 'styled-components';
import {ChevronDown} from 'lucide-react';
import {designTokens as t} from '../../design-system/tokens/designTokens';
const Box=styled.details`
 border:1px solid ${t.color.border.subtle};border-radius:12px;background:${t.color.bg.surface};min-width:0;
 >summary{display:flex;align-items:center;gap:12px;min-height:64px;padding:16px 20px;cursor:pointer;list-style:none;font-size:18px;font-weight:600;flex-wrap:wrap;}
 >summary::-webkit-details-marker{display:none;}
 >summary:focus-visible{outline:2px solid ${t.color.text.primary};outline-offset:3px;border-radius:12px;}
 >summary .settings-chevron{margin-left:auto;flex-shrink:0;transition:transform .15s;}
 &[open]>summary .settings-chevron{transform:rotate(180deg);}
 >summary small{font-size:12px;font-weight:400;color:${t.color.text.secondary};}
 >div{padding:0 20px 20px;min-width:0;} >div>section,>div>form>section{border:0;padding:0;}
 @media(prefers-reduced-motion:reduce){>summary .settings-chevron{transition:none;}}
 @media(max-width:767px){>summary{padding:16px;} >div{padding:0 16px 16px;}}
`;
export function SettingsDisclosure({title,icon,dirty,children}:{title:string;icon:ReactNode;dirty?:boolean;children:ReactNode}){
 return <Box><summary>{icon}<span>{title}</span>{dirty?<small>Neuložené změny</small>:null}<ChevronDown size={20} className="settings-chevron" aria-hidden="true"/></summary><div>{children}</div></Box>;
}
