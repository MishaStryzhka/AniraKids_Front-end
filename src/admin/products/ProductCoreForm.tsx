import { forwardRef,useEffect,useImperativeHandle,useRef,type FormEvent,type ReactNode } from 'react';
import styled from 'styled-components';
import { X } from 'lucide-react';
import { Input } from '../../design-system/components/Input';
import { Button } from '../../design-system/components/Button';
import { IconButton } from '../../design-system/components/IconButton';
import { NavigationLink } from '../../design-system/components/NavigationLink';
import { SelectField } from '../../design-system/components/SelectField';
import { StatusBadge } from '../../design-system/components/StatusBadge';
import { TextareaField } from '../../design-system/components/TextareaField';
import { CheckboxField } from '../../design-system/components/CheckboxField';
import { designTokens as t } from '../../design-system/tokens/designTokens';
import type {AdminProductStatus,AdminProductOccasion} from '../api/products';
import {adminRoutes} from '../navigation/adminRoutes';
import {categoryLabels,genderLabels,statusPresentation} from './productListPresentation';
import type {ProductCoreErrors,ProductCoreField} from './productCoreValidation';
import type {ProductCoreFormState} from './productCoreFormModel';

const Root=styled.form`inline-size:100%;max-inline-size:840px;display:grid;gap:${t.space[8]};font-family:${t.font.family.ui};`;
const Section=styled.section`display:grid;gap:${t.space[4]};min-inline-size:0;`;
const H2=styled.h2`margin:0;font-size:22px;line-height:30px;`;
const Grid=styled.div`display:grid;grid-template-columns:minmax(0,1fr);gap:${t.space[4]};min-inline-size:0;@media(min-width:${t.breakpoint.md}){grid-template-columns:repeat(2,minmax(0,1fr));}`;
const Span=styled.div`min-inline-size:0;@media(min-width:${t.breakpoint.md}){grid-column:1/-1;}`;
const Fieldset=styled.fieldset`min-inline-size:0;margin:0;padding:0;border:0;display:grid;gap:${t.space[3]};`;
const Legend=styled.legend`padding:0 0 ${t.space[2]};font-weight:${t.font.weight.semibold};`;
const Occasions=styled.div`display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:${t.space[2]};@media(min-width:${t.breakpoint.md}){grid-template-columns:repeat(3,minmax(0,1fr));}`;
const Commercial=styled.div`display:grid;gap:${t.space[4]};@media(min-width:${t.breakpoint.md}){padding-inline-start:${t.space[8]};}`;
const ErrorText=styled.p`margin:${t.space[1]} 0 0;color:${t.color.status.danger.strong};font-size:${t.type.bodySm.size};line-height:${t.type.bodySm.lineHeight};`;
const Hint=styled.span`position:absolute;inline-size:1px;block-size:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;`;
const TagRow=styled.div`display:grid;grid-template-columns:minmax(0,1fr) 44px;gap:${t.space[2]};align-items:end;`;
const Footer=styled.div`display:flex;flex-direction:column;align-items:flex-start;gap:${t.space[3]};@media(min-width:${t.breakpoint.md}){flex-direction:row-reverse;justify-content:flex-start;}`;
const occasionLabels:Record<AdminProductOccasion,string>={wedding:'Svatba',birthday:'Narozeniny',christening:'Křtiny',photoshoot:'Focení',celebration:'Oslava',other:'Jiné'};
export interface ProductCoreFormHandle{focus(target:ProductCoreField):void}
interface Props{mode:'create'|'edit';status?:AdminProductStatus;value:ProductCoreFormState;errors:ProductCoreErrors;ageTagErrors:Record<number,string>;submitting:boolean;saveDisabled:boolean;submitError?:string|null;onChange(value:ProductCoreFormState):void;onSubmit():void}
export const ProductCoreForm=forwardRef<ProductCoreFormHandle,Props>(function ProductCoreForm({mode,status,value,errors,ageTagErrors,submitting,saveDisabled,submitError,onChange,onSubmit},ref){
 const refs=useRef<Partial<Record<ProductCoreField,HTMLElement>>>({});const newTagRef=useRef<HTMLInputElement|null>(null);const previousTagCount=useRef(value.ageTags.length);
 useEffect(()=>{if(value.ageTags.length>previousTagCount.current)newTagRef.current?.focus();previousTagCount.current=value.ageTags.length},[value.ageTags.length]);
 useImperativeHandle(ref,()=>({focus(target){const node=refs.current[target];node?.scrollIntoView({block:'center'});node?.focus({preventScroll:true})}}),[]);
 const set=<K extends keyof ProductCoreFormState>(key:K,next:ProductCoreFormState[K])=>onChange({...value,[key]:next});
 const err=(key:ProductCoreField)=>errors[key]?<ErrorText id={`core-${key}-error`} role="alert">{errors[key]}</ErrorText>:null;
 const input=(key:keyof Pick<ProductCoreFormState,'name'|'slug'|'color'|'brand'|'familyLookGroup'|'seoTitle'|'seoDescription'>,label:string,extra:Record<string,unknown>={})=><div><Input label={label} value={value[key]} onChange={e=>set(key,e.target.value)} error={Boolean(errors[key])} aria-describedby={errors[key]?`core-${key}-error`:undefined} ref={el=>{refs.current[key]=el??undefined}} {...extra}/>{err(key)}</div>;
 const money=(key:keyof Pick<ProductCoreFormState,'rentalStudioPrice'|'rentalExternalPrice'|'defaultDeposit'|'defaultSalePrice'>,label:string)=><div><Hint id={`core-${key}-currency`}>Částka v Kč.</Hint><Input label={label} type="text" inputMode="numeric" value={value[key]} onChange={e=>set(key,e.target.value)} trailingAction={<span aria-hidden="true">Kč</span>} error={Boolean(errors[key])} aria-describedby={[`core-${key}-currency`,errors[key]?`core-${key}-error`:null].filter(Boolean).join(' ')} ref={el=>{refs.current[key]=el??undefined}}/>{err(key)}</div>;
 return <Root data-product-core-form onSubmit={(e:FormEvent)=>{e.preventDefault();onSubmit()}}>
  {mode==='edit'&&status?<div><StatusBadge tone={statusPresentation[status].tone}>{statusPresentation[status].label}</StatusBadge></div>:null}
  <Section><H2>Základní informace</H2><Grid>{input('name','Název')}{input('slug','URL / slug')}<Span><TextareaField label="Popis" value={value.description} onChange={e=>set('description',e.target.value)} error={Boolean(errors.description)} aria-describedby={errors.description?'core-description-error':undefined} ref={el=>{refs.current.description=el??undefined}}/>{err('description')}</Span></Grid></Section>
  <Section><H2>Zařazení</H2><Grid><div><SelectField label="Kategorie" value={value.category} onChange={e=>set('category',e.target.value as any)} aria-invalid={Boolean(errors.category)||undefined} aria-describedby={errors.category?'core-category-error':undefined} ref={el=>{refs.current.category=el??undefined}}><option value="">Neuvedeno</option>{Object.entries(categoryLabels).map(([k,v])=><option key={k} value={k}>{v}</option>)}</SelectField>{err('category')}</div><div><SelectField label="Určení" value={value.gender} onChange={e=>set('gender',e.target.value as any)} aria-invalid={Boolean(errors.gender)||undefined} aria-describedby={errors.gender?'core-gender-error':undefined} ref={el=>{refs.current.gender=el??undefined}}><option value="">Neuvedeno</option>{Object.entries(genderLabels).map(([k,v])=><option key={k} value={k}>{v}</option>)}</SelectField>{err('gender')}</div>{input('color','Barva')}<div/>
   <Span><Fieldset><Legend>Příležitosti</Legend><Occasions>{Object.entries(occasionLabels).map(([key,label])=><CheckboxField key={key} label={label} checked={value.occasion.includes(key as AdminProductOccasion)} onChange={e=>set('occasion',e.target.checked?[...value.occasion,key as AdminProductOccasion]:value.occasion.filter(x=>x!==key))}/>)}</Occasions></Fieldset></Span>
   <Span><Fieldset><Legend>Věkové označení</Legend>{value.ageTags.map((tag,i)=><TagRow key={i}><div><Input label={`Věkové označení ${i+1}`} value={tag} onChange={e=>set('ageTags',value.ageTags.map((x,j)=>j===i?e.target.value:x))} error={Boolean(ageTagErrors[i])} ref={el=>{if(i===value.ageTags.length-1)newTagRef.current=el}}/>{ageTagErrors[i]?<ErrorText role="alert">{ageTagErrors[i]}</ErrorText>:null}</div><IconButton type="button" aria-label={`Odebrat věkové označení ${i+1}`} icon={<X aria-hidden="true"/>} onClick={()=>set('ageTags',value.ageTags.filter((_,j)=>j!==i))}/></TagRow>)}<Button type="button" variant="secondary" disabled={value.ageTags.length>=20} onClick={()=>set('ageTags',[...value.ageTags,''])}>Přidat označení</Button>{err('ageTags')}</Fieldset></Span>
   {input('brand','Značka')}{input('familyLookGroup','Rodinný look')}
  </Grid></Section>
  <Section><H2>Nabídka a ceny</H2><Fieldset><Legend>Pronájem</Legend><CheckboxField label="Nabízet produkt k pronájmu" checked={value.rentalEnabled} onChange={e=>set('rentalEnabled',e.target.checked)}/>{value.rentalEnabled?<Commercial><Grid>{money('rentalStudioPrice','Cena ve studiu')}{money('rentalExternalPrice','Cena mimo studio')}{money('defaultDeposit','Záloha')}</Grid></Commercial>:null}</Fieldset><Fieldset><Legend>Prodej</Legend><CheckboxField label="Nabízet produkt k prodeji" checked={value.saleEnabled} onChange={e=>set('saleEnabled',e.target.checked)}/>{value.saleEnabled?<Commercial><Grid>{money('defaultSalePrice','Prodejní cena')}</Grid></Commercial>:null}</Fieldset></Section>
  <Section><H2>SEO</H2><Grid>{input('seoTitle','SEO titulek')}{input('seoDescription','SEO popis')}</Grid></Section>
  {submitError?<ErrorText role="alert">{submitError}</ErrorText>:null}
  <Footer data-product-core-footer><Button type="submit" loading={submitting} disabled={saveDisabled}>{submitting?'Ukládání…':'Uložit'}</Button><NavigationLink variant="plain" to={adminRoutes.products}>Zpět</NavigationLink></Footer>
 </Root>
});