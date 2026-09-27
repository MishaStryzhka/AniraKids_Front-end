import { useEffect, useId, useRef, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import { designTokens as t } from '../../tokens/designTokens';
const Backdrop=styled.div`position:fixed;inset:0;z-index:${t.layer.modal};display:grid;place-items:center;padding:${t.space[4]};background:rgb(41 37 34 / 42%);`;
const Panel=styled.div`inline-size:min(100%,520px);padding:${t.space[6]};border-radius:${t.radius[3]};background:${t.color.bg.surface};box-shadow:${t.shadow.overlay};color:${t.color.text.primary};`;
const Title=styled.h2`margin:0 0 ${t.space[3]};font-size:24px;line-height:32px;`;
const Description=styled.p`margin:0 0 ${t.space[6]};color:${t.color.text.secondary};`;
export interface DialogProps{open:boolean;title:string;description?:string;onEscape():void;initialFocusRef?:RefObject<HTMLElement>;children:ReactNode}
export function Dialog({open,title,description,onEscape,initialFocusRef,children}:DialogProps){
 const titleId=useId(),descriptionId=useId(),panelRef=useRef<HTMLDivElement>(null);
 useEffect(()=>{if(!open)return;const previous=document.activeElement as HTMLElement|null;const root=document.getElementById('root');const hadInert=root?.hasAttribute('inert');root?.setAttribute('inert','');root?.setAttribute('aria-hidden','true');
 const panel=panelRef.current;const focusables=()=>Array.from(panel?.querySelectorAll<HTMLElement>('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')??[]).filter(x=>!x.hasAttribute('disabled'));
 (initialFocusRef?.current??focusables()[0])?.focus();
 const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.preventDefault();onEscape();return}if(e.key!=='Tab')return;const list=focusables();if(!list.length)return;const first=list[0],last=list[list.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}};
 document.addEventListener('keydown',key);return()=>{document.removeEventListener('keydown',key);if(root){if(!hadInert)root.removeAttribute('inert');root.removeAttribute('aria-hidden')}previous?.focus?.()};},[open,onEscape,initialFocusRef]);
 if(!open)return null;
 return createPortal(<Backdrop><Panel ref={panelRef} role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={description?descriptionId:undefined}><Title id={titleId}>{title}</Title>{description?<Description id={descriptionId}>{description}</Description>:null}{children}</Panel></Backdrop>,document.body);
}