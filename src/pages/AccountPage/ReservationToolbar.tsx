import {useRef,useState} from 'react';
import styled from 'styled-components';
import {Search,SlidersHorizontal,ArrowDownUp,X} from 'lucide-react';
export type ReservationFilters={q:string;status:string;sort:string;kind:string};
export const initialReservationFilters:ReservationFilters={q:'',status:'all',sort:'newest',kind:'all'};
const Bar=styled.div`display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-bottom:24px;min-width:0;`;
const Icon=styled.button`width:44px;height:44px;display:inline-flex;align-items:center;justify-content:center;background:white;color:inherit;border:1px solid #ded5ce;border-radius:8px;cursor:pointer;&:focus-visible{outline:2px solid #806858;outline-offset:2px;}`;
const Field=styled.input`box-sizing:border-box;width:100%;min-width:0;min-height:44px;padding:10px 12px;border:1px solid #ded5ce;border-radius:8px;font:inherit;`;
const Select=styled.select`max-width:100%;min-height:44px;padding:8px;border:1px solid #ded5ce;border-radius:8px;background:white;font:inherit;`;
const SearchWrap=styled.div<{$open:boolean}>`display:grid;grid-template-columns:${p=>p.$open?'1fr':'0fr'};transition:grid-template-columns .2s ease;max-width:320px;flex:${p=>p.$open?'1 1 180px':'0 0 0'};overflow:hidden;@media(prefers-reduced-motion:reduce){transition:none;}`;
export function ReservationToolbar({value,onChange}:{value:ReservationFilters;onChange:(v:ReservationFilters)=>void}){
 const [search,setSearch]=useState(false),[filters,setFilters]=useState(false),[sort,setSort]=useState(false);
 const input=useRef<HTMLInputElement>(null);
 const update=(key:keyof ReservationFilters,v:string)=>onChange({...value,[key]:v});
 return <Bar aria-label="Nástroje rezervací">
 <SearchWrap $open={search}><div style={{minWidth:0}}>{search?<Field ref={input} autoFocus aria-label="Hledat rezervaci" placeholder="Číslo rezervace nebo název modelu" maxLength={100} value={value.q} onChange={e=>update('q',e.target.value)} onKeyDown={e=>{if(e.key==='Escape'){setSearch(false);update('q','');}}}/>:null}</div></SearchWrap>
 <Icon aria-label={search?'Zavřít hledání':'Hledat rezervace'} aria-expanded={search} onClick={()=>{setSearch(!search);if(search)update('q','');}}>{search?<X size={20}/>:<Search size={20}/>}</Icon>
 <Icon aria-label="Filtrovat rezervace" aria-expanded={filters} onClick={()=>setFilters(!filters)}><SlidersHorizontal size={20}/></Icon>
 <Icon aria-label="Seřadit rezervace" aria-expanded={sort} onClick={()=>setSort(!sort)}><ArrowDownUp size={20}/></Icon>
 {filters?<><label>Typ <Select aria-label="Typ rezervace" value={value.kind} onChange={e=>update('kind',e.target.value)}><option value="all">Vše</option><option value="rental">Pronájmy</option><option value="fitting">Zkoušky</option></Select></label><label>Stav <Select aria-label="Stav rezervace" value={value.status} onChange={e=>update('status',e.target.value)}><option value="all">Všechny stavy</option><option value="active">Aktivní</option><option value="finished">Dokončené</option><option value="cancelled">Zrušené a vypršené</option></Select></label></>:null}
 {sort?<label>Řazení <Select aria-label="Řazení rezervací" value={value.sort} onChange={e=>update('sort',e.target.value)}><option value="newest">Nejnovější</option><option value="oldest">Nejstarší</option><option value="date_asc">Termín od nejbližšího</option><option value="date_desc">Termín od nejpozdějšího</option></Select></label>:null}
 {value.q||value.status!=='all'||value.kind!=='all'||value.sort!=='newest'?<button type="button" style={{minHeight:44}} onClick={()=>onChange(initialReservationFilters)}>Zrušit filtry</button>:null}
 </Bar>;
}
