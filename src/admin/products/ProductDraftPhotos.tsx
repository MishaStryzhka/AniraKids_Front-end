import {useEffect, useRef, useState} from 'react';
import styled from 'styled-components';
import {ImagePlus, Sparkles, X} from 'lucide-react';
import {Button} from '../../design-system/components/Button';
import {IconButton} from '../../design-system/components/IconButton';
import {designTokens as t} from '../../design-system/tokens/designTokens';
import {AdminApiError} from '../api/errors';
import {completeDraftPhoto, removeDraftPhoto, signDraftPhoto, suggestDraft, type DraftPhoto, type ProductSuggestion} from '../api/productAssistant';
import {uploadProductMedia} from '../media/productMediaProviderTransport';
import {productMediaCandidate} from '../api/productMedia';
const Root=styled.section`display:grid;gap:${t.space[3]};padding:${t.space[4]};border:1px solid ${t.color.border.subtle};border-radius:${t.radius[2]};background:${t.color.bg.surface};h2,p{margin:0;}p{color:${t.color.text.secondary};}`;
const Grid=styled.div`display:grid;grid-template-columns:repeat(auto-fill,minmax(100px,128px));gap:${t.space[2]};`;
const Photo=styled.div`position:relative;img{display:block;width:100%;aspect-ratio:3/4;object-fit:cover;border-radius:${t.radius[2]};}button{position:absolute;right:4px;top:4px;background:rgba(250,248,246,.9);}`;
const Actions=styled.div`display:flex;flex-wrap:wrap;gap:${t.space[2]};button{white-space:normal;}`;
export function ProductDraftPhotos({token,ensureDraft,photos,onPhotos,onSuggestion,onBusy,disabled,onAccessError}: {
 token:string;ensureDraft():Promise<string>;photos:DraftPhoto[];onPhotos(photos:DraftPhoto[]):void;onSuggestion(value:ProductSuggestion):void;onBusy(busy:boolean):void;disabled:boolean;onAccessError(error:unknown):boolean;
}){
 const input=useRef<HTMLInputElement>(null),inFlight=useRef(false);
 const [busy,setBusy]=useState(''),[error,setError]=useState('');
 const [pending,setPending]=useState<{id:string;publicId:string}|null>(null);
 useEffect(()=>{onBusy(Boolean(busy)||Boolean(pending));},[busy,pending,onBusy]);
 const run=async(label:string,action:()=>Promise<void>)=>{if(inFlight.current||disabled)return;inFlight.current=true;setBusy(label);setError('');try{await action();}catch(e){if(!onAccessError(e))setError(e instanceof AdminApiError&&e.code.startsWith('AI_')?e.message:e instanceof AdminApiError&&e.code==='RATE_LIMITED'?e.message:'Akce se nezdařila. Zkuste to znovu; údaje zůstaly zachované.');}finally{inFlight.current=false;setBusy('');}};
 const upload=(file:File)=>run('Nahrávání fotografie…',async()=>{
   if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>15*1024*1024){setError('Vyberte JPG, PNG nebo WebP do 15 MB.');return;}
   const id=await ensureDraft();const {upload}=await signDraftPhoto(token,id);const publicId=productMediaCandidate(upload);
   setPending({id,publicId});
   await uploadProductMedia({upload,file});
   const response=await completeDraftPhoto(token,id,publicId);onPhotos(response.photos);setPending(null);
 });
 return <Root aria-labelledby="draft-photos-title"><h2 id="draft-photos-title">Fotografie</h2><p>Nejprve přidejte fotografie. AI navrhne údaje z prvních pěti snímků, které před uložením zkontrolujete.</p>
  <Grid>{photos.map((photo,index)=><Photo key={photo.publicId}><img src={photo.url} alt={`Fotografie produktu ${index+1}`}/><IconButton type="button" aria-label={`Odebrat fotografii ${index+1}`} icon={<X aria-hidden="true"/>} disabled={disabled||Boolean(busy)} onClick={()=>void run('Odebírání…',async()=>{const id=await ensureDraft();onPhotos((await removeDraftPhoto(token,id,photo.publicId)).photos);})}/></Photo>)}</Grid>
  <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={e=>{const file=e.target.files?.[0];e.target.value='';if(file)void upload(file);}}/>
  <Actions><Button type="button" variant="secondary" disabled={disabled||Boolean(busy)||photos.length>=10||Boolean(pending)} onClick={()=>input.current?.click()}><ImagePlus size={18} aria-hidden="true"/> Přidat fotografii</Button>
  <Button type="button" variant="secondary" disabled={disabled||Boolean(busy)||!photos.length||Boolean(pending)} onClick={()=>void run('AI připravuje návrh…',async()=>{onSuggestion((await suggestDraft(token,await ensureDraft())).suggestion);})}><Sparkles size={18} aria-hidden="true"/> Navrhnout pomocí AI</Button></Actions>
  {busy?<p role="status">{busy}</p>:null}{error?<p role="alert">{error}</p>:null}
  {pending&&!busy?<><p>Nahrání fotografie není potvrzené. Ověřte výsledek, nebo pokračujte bez této fotografie.</p><Actions><Button type="button" variant="secondary" disabled={disabled} onClick={()=>void run('Ověřování fotografie…',async()=>{onPhotos((await completeDraftPhoto(token,pending.id,pending.publicId)).photos);setPending(null);})}>Ověřit nahrání</Button><Button type="button" variant="secondary" disabled={disabled} onClick={()=>setPending(null)}>Pokračovat bez fotografie</Button></Actions></>:null}
 </Root>;
}
