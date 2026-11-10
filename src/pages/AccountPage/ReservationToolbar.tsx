import {useEffect,useId,useRef,useState} from 'react';
import styled from 'styled-components';
import {Search,SlidersHorizontal,ArrowDownUp,X} from 'lucide-react';
export type ReservationFilters={q:string;status:string;sort:string;kind:string};
export const initialReservationFilters:ReservationFilters={q:'',status:'all',sort:'newest',kind:'all'};
const Bar=styled.div`position:relative;display:flex;align-items:center;gap:8px;margin-bottom:24px;width:100%;flex:0 1 420px;max-width:100%;min-width:0;`;
const Icon=styled.button`flex:0 0 44px;width:44px;height:44px;display:inline-flex;align-items:center;justify-content:center;background:white;color:inherit;border:1px solid #ded5ce;border-radius:8px;cursor:pointer;&:focus-visible{outline:2px solid #806858;outline-offset:2px;}`;
const SearchSlot=styled.div`position:relative;flex:1;min-width:44px;height:44px;`;
const SearchBox=styled.div<{$open:boolean}>`position:absolute;right:0;top:0;display:flex;align-items:center;box-sizing:border-box;width:${p=>p.$open?'100%':'44px'};height:44px;border:1px solid #ded5ce;border-radius:8px;background:white;overflow:hidden;transition:width .22s ease;${Icon}{border:0;border-radius:0;flex-basis:42px;width:42px;height:42px;} &:focus-within{outline:2px solid #806858;outline-offset:2px;}@media(prefers-reduced-motion:reduce){transition:none;}`;
const Field=styled.input<{$open:boolean}>`box-sizing:border-box;flex:1;width:0;min-width:0;height:42px;padding:${p=>p.$open?'8px 10px':'0'};border:0;outline:0;font:inherit;background:transparent;opacity:${p=>p.$open?1:0};visibility:${p=>p.$open?'visible':'hidden'};`;
const Menu=styled.div`position:absolute;right:0;top:52px;z-index:20;box-sizing:border-box;width:320px;max-width:100%;display:grid;gap:14px;padding:16px;background:white;border:1px solid #ded5ce;border-radius:10px;box-shadow:0 8px 24px #0000001a;label{display:grid;gap:6px;font-size:14px;}`;
const Select=styled.select`width:100%;min-width:0;min-height:44px;padding:8px;border:1px solid #ded5ce;border-radius:8px;background:white;font:inherit;`;
const Reset=styled.button`min-height:44px;background:none;border:0;text-decoration:underline;color:#7A6254;text-align:left;font:inherit;cursor:pointer;`;
export function ReservationToolbar({value,onChange}:{value:ReservationFilters;onChange:(v:ReservationFilters)=>void}){
 const [search,setSearch]=useState(false),[menu,setMenu]=useState<'filters'|'sort'|null>(null);
 const root=useRef<HTMLDivElement>(null),input=useRef<HTMLInputElement>(null),searchButton=useRef<HTMLButtonElement>(null),filterButton=useRef<HTMLButtonElement>(null),sortButton=useRef<HTMLButtonElement>(null);
 const id=useId();
 const update=(key:keyof ReservationFilters,v:string)=>onChange({...value,[key]:v});
 const closeSearch=()=>{setSearch(false);update('q','');searchButton.current?.focus({preventScroll:true});};
 useEffect(()=>{if(search)input.current?.focus({preventScroll:true});},[search]);
 useEffect(()=>{
  if(!menu)return;
  root.current?.querySelector<HTMLSelectElement>('[role="dialog"] select')?.focus({preventScroll:true});
  const outside=(e:PointerEvent)=>{if(e.target instanceof Node&&!root.current?.contains(e.target))setMenu(null);};
  document.addEventListener('pointerdown',outside);
  return ()=>document.removeEventListener('pointerdown',outside);
 },[menu]);
 const toggle=(next:'filters'|'sort')=>setMenu(menu===next?null:next);
 return <Bar ref={root} aria-label="Nástroje rezervací" onBlur={e=>{if(e.relatedTarget instanceof Node&&!e.currentTarget.contains(e.relatedTarget))setMenu(null);}} onKeyDown={e=>{
  if(e.key!=='Escape')return;
  if(menu){e.stopPropagation();(menu==='filters'?filterButton:sortButton).current?.focus({preventScroll:true});setMenu(null);}else if(search)closeSearch();
 }}>
 <SearchSlot><SearchBox $open={search}>
  <Field $open={search} ref={input} id={id+'-search'} tabIndex={search?0:-1} aria-hidden={!search} aria-label="Hledat rezervaci" placeholder="Číslo rezervace nebo model" maxLength={100} value={value.q} onChange={e=>update('q',e.target.value)}/>
  <Icon type="button" ref={searchButton} aria-label={search?'Zavřít hledání':'Hledat rezervace'} aria-expanded={search} aria-controls={id+'-search'} onClick={()=>{setMenu(null);if(search)closeSearch();else setSearch(true);}}>{search?<X size={20}/>:<Search size={20}/>}</Icon>
 </SearchBox></SearchSlot>
 <Icon type="button" ref={filterButton} aria-label="Filtrovat rezervace" aria-haspopup="dialog" aria-expanded={menu==='filters'} aria-controls={id+'-filters'} onClick={()=>toggle('filters')}><SlidersHorizontal size={20}/></Icon>
 <Icon type="button" ref={sortButton} aria-label="Seřadit rezervace" aria-haspopup="dialog" aria-expanded={menu==='sort'} aria-controls={id+'-sort'} onClick={()=>toggle('sort')}><ArrowDownUp size={20}/></Icon>
 {menu==='filters'?<Menu id={id+'-filters'} role="dialog" aria-label="Filtry rezervací">
  <label>Typ <Select aria-label="Typ rezervace" value={value.kind} onChange={e=>update('kind',e.target.value)}><option value="all">Vše</option><option value="rental">Pronájmy</option><option value="fitting">Zkoušky</option></Select></label>
  <label>Stav <Select aria-label="Stav rezervace" value={value.status} onChange={e=>update('status',e.target.value)}><option value="all">Všechny stavy</option><option value="active">Aktivní</option><option value="finished">Dokončené</option><option value="cancelled">Zrušené a vypršené</option></Select></label>
  <Reset type="button" onClick={()=>onChange({...value,status:'all',kind:'all'})}>Zrušit filtry</Reset>
 </Menu>:null}
 {menu==='sort'?<Menu id={id+'-sort'} role="dialog" aria-label="Možnosti řazení">
  <label>Řazení <Select aria-label="Řazení rezervací" value={value.sort} onChange={e=>{update('sort',e.target.value);setMenu(null);sortButton.current?.focus({preventScroll:true});}}><option value="newest">Nejnovější</option><option value="oldest">Nejstarší</option><option value="date_asc">Termín od nejbližšího</option><option value="date_desc">Termín od nejpozdějšího</option></Select></label>
 </Menu>:null}
 </Bar>;
}
