import {useEffect,useRef,type ReactNode} from 'react';
import {useLocation} from 'react-router-dom';
import styled from 'styled-components';
import {ChevronDown} from 'lucide-react';
import {designTokens as t} from '../../design-system/tokens/designTokens';
const Box=styled.details`
 scroll-margin-top:96px;
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
export function SettingsDisclosure({id,title,icon,dirty,children}:{id?:string;title:string;icon:ReactNode;dirty?:boolean;children:ReactNode}){
 const ref=useRef<HTMLDetailsElement>(null);
 const {hash}=useLocation();
 useEffect(()=>{
  if(!id||hash!=='#'+id||!ref.current)return;
  ref.current.open=true;
  ref.current.scrollIntoView({block:'start'});
  ref.current.querySelector('summary')?.focus({preventScroll:true});
 },[hash,id]);
 return <Box id={id} ref={ref}><summary>{icon}<span>{title}</span>{dirty?<small>Neuložené změny</small>:null}<ChevronDown size={20} className="settings-chevron" aria-hidden="true"/></summary><div>{children}</div></Box>;
}
