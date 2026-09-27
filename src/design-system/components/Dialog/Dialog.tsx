import {useEffect,useId,useRef,type ReactNode,type RefObject} from 'react';
import {createPortal} from 'react-dom';
import styled from 'styled-components';
import {designTokens as t} from '../../tokens/designTokens';
const Backdrop=styled.div`position:fixed;inset:0;z-index:${t.layer.modal};display:grid;place-items:center;padding:max(${t.space[4]},env(safe-area-inset-top)) max(${t.space[4]},env(safe-area-inset-right)) max(${t.space[4]},env(safe-area-inset-bottom)) max(${t.space[4]},env(safe-area-inset-left));background:rgb(41 37 34 / 42%);overflow:hidden;`;
const Panel=styled.div`inline-size:min(100%,520px);max-block-size:calc(100vh - 32px);max-block-size:calc(100dvh - 32px);min-block-size:0;overflow-y:auto;overscroll-behavior:contain;padding:${t.space[6]};box-sizing:border-box;border-radius:${t.radius[3]};background:${t.color.bg.surface};box-shadow:${t.shadow.overlay};color:${t.color.text.primary};`;
const Title=styled.h2`margin:0 0 ${t.space[3]};font-size:24px;line-height:32px;`;
const Description=styled.p`margin:0 0 ${t.space[6]};color:${t.color.text.secondary};`;
export interface DialogProps{open:boolean;title:string;description?:string;onEscape():void;initialFocusRef?:RefObject<HTMLElement>;resolveRestoreFocus?(previous:HTMLElement|null):HTMLElement|null;children:ReactNode}
const eligible=(el:HTMLElement|null|undefined,programmatic=false)=>Boolean(el&&el.isConnected&&!el.hasAttribute('disabled')&&el.getAttribute('aria-hidden')!=='true'&&(programmatic||el.tabIndex>=0));
export function Dialog({open,title,description,onEscape,initialFocusRef,resolveRestoreFocus,children}:DialogProps){
 const titleId=useId(),descriptionId=useId(),panelRef=useRef<HTMLDivElement>(null),escapeRef=useRef(onEscape),restoreRef=useRef(resolveRestoreFocus),openId=useRef(0);
 escapeRef.current=onEscape;restoreRef.current=resolveRestoreFocus;
 useEffect(()=>{if(!open)return;const identity=++openId.current,previous=document.activeElement as HTMLElement|null,root=document.getElementById('root'),html=document.documentElement,body=document.body;
 const rootInert=root?.hasAttribute('inert')??false,rootAria=root?.getAttribute('aria-hidden'),bodyOverflow=body.style.overflow,bodyPadding=body.style.paddingRight,htmlOverflow=html.style.overflow,scrollX=window.scrollX,scrollY=window.scrollY;
 root?.setAttribute('inert','');root?.setAttribute('aria-hidden','true');body.style.overflow='hidden';html.style.overflow='hidden';
 const panel=panelRef.current,focusables=()=>Array.from(panel?.querySelectorAll<HTMLElement>('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')??[]).filter(el=>eligible(el));
 const initial=initialFocusRef?.current;if(identity===openId.current)(eligible(initial)?initial:focusables()[0])?.focus();
 const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.preventDefault();escapeRef.current();return}if(e.key!=='Tab')return;const list=focusables();if(!list.length)return;const first=list[0],last=list[list.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}};
 document.addEventListener('keydown',key);
 return()=>{openId.current=identity+1;document.removeEventListener('keydown',key);if(root){if(!rootInert)root.removeAttribute('inert');if(rootAria==null)root.removeAttribute('aria-hidden');else root.setAttribute('aria-hidden',rootAria)}body.style.overflow=bodyOverflow;body.style.paddingRight=bodyPadding;html.style.overflow=htmlOverflow;if(!/jsdom/i.test(window.navigator.userAgent))window.scrollTo(scrollX,scrollY);const target=restoreRef.current?restoreRef.current(previous):previous;requestAnimationFrame(()=>{if(eligible(target,true))target!.focus()})};
 },[open,initialFocusRef]);
 if(!open)return null;
 return createPortal(<Backdrop><Panel ref={panelRef} role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={description?descriptionId:undefined}><Title id={titleId}>{title}</Title>{description?<Description id={descriptionId}>{description}</Description>:null}{children}</Panel></Backdrop>,document.body);
}
