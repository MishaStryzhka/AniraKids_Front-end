import {useEffect,useRef,useState} from 'react';
import styled from 'styled-components';
import {useAuth} from '../../hooks/useAuth';
import {adminApiClient,buildAdminRequestConfig} from '../api/client';
import {useAdminAccess} from '../auth/AdminAccessBoundary';
import {permissionLabels,type Permission} from '../auth/permissions';
import {Button} from '../../design-system/components/Button';
import {Input} from '../../design-system/components/Input';
import {CheckboxField} from '../../design-system/components/CheckboxField';
import {Dialog} from '../../design-system/components/Dialog';
import {designTokens as t} from '../../design-system/tokens/designTokens';
const Card=styled.section`border:1px solid ${t.color.border.subtle};border-radius:12px;background:${t.color.bg.surface};padding:24px;min-width:0;h2,h3{margin:0;}@media(max-width:767px){padding:16px;}`;
const Stack=styled.div`display:grid;gap:16px;min-width:0;`;
const Row=styled.div`border-top:1px solid ${t.color.border.subtle};padding-top:16px;display:grid;gap:10px;overflow-wrap:anywhere;`;
const Actions=styled.div`display:flex;gap:12px;flex-wrap:wrap;@media(max-width:767px){>button{width:100%;}}`;
interface Administrator {id:string;name:string;email:string;owner:boolean;permissions:Permission[];revision:number;}
interface List {owners:Administrator[];items:Administrator[];total:number;}
const errorText=(e:any)=>({USER_NOT_FOUND:'Registrovaný účet s tímto e-mailem nebyl nalezen.',ACCESS_CONFLICT:'Oprávnění se mezitím změnila nebo předchozí uložení již proběhlo. Vyhledejte účet znovu a ověřte aktuální stav.',OWNER_PROTECTED:'Hlavnímu administrátorovi zde nelze odebrat ani změnit přístup.'}[e?.response?.data?.error?.code as string]||'Výsledek se nepodařilo ověřit. Obnovte seznam a zkontrolujte aktuální oprávnění.');
export function AdministratorsSection({onDirty}:{onDirty:(dirty:boolean)=>void}){
 const {token}=useAuth(),{handleRequestError}=useAdminAccess();
 const [list,setList]=useState<List|null>(null),[page,setPage]=useState(1),[revision,setRevision]=useState(0),[email,setEmail]=useState(''),[selected,setSelected]=useState<Administrator|null>(null),[permissions,setPermissions]=useState<Permission[]>([]),[error,setError]=useState(''),[notice,setNotice]=useState(''),[busy,setBusy]=useState(false),[confirm,setConfirm]=useState(false);
 const request=useRef<AbortController|null>(null),lock=useRef(false);
 const dirty=Boolean(selected&&!selected.owner&&JSON.stringify([...permissions].sort())!==JSON.stringify([...selected.permissions].sort()));
 useEffect(()=>{onDirty(dirty||busy);return()=>onDirty(false);},[dirty,busy,onDirty]);
 useEffect(()=>{const c=new AbortController();setList(null);adminApiClient.get<List>('/admin/administrators?page='+page,buildAdminRequestConfig(token,c.signal)).then(r=>{if(!c.signal.aborted)setList(r.data);}).catch(e=>{if(!c.signal.aborted&&!handleRequestError(e))setError(errorText(e));});return()=>c.abort();},[token,page,revision,handleRequestError]);
 useEffect(()=>()=>request.current?.abort(),[]);
 function choose(user:Administrator){setSelected(user);setPermissions(user.permissions);setError('');setNotice('');}
 async function lookup(){
  if(lock.current||dirty)return;lock.current=true;setBusy(true);setError('');setNotice('');setSelected(null);
  const c=new AbortController();request.current=c;
  try{const r=await adminApiClient.post<Administrator>('/admin/administrators/lookup',{email:email.trim()},buildAdminRequestConfig(token,c.signal));if(!c.signal.aborted)choose(r.data);}
  catch(e){if(!c.signal.aborted&&!handleRequestError(e))setError(errorText(e));}
  finally{if(!c.signal.aborted){lock.current=false;setBusy(false);}}
 }
 async function save(){
  if(!selected||selected.owner||lock.current)return;lock.current=true;setBusy(true);setConfirm(false);setError('');setNotice('');
  const c=new AbortController();request.current=c;
  try{const r=await adminApiClient.patch('/admin/administrators/'+selected.id,{permissions,revision:selected.revision},buildAdminRequestConfig(token,c.signal));if(!c.signal.aborted){setSelected({...selected,permissions,revision:r.data.revision});setRevision(x=>x+1);setNotice(permissions.length?'Oprávnění byla uložena.':'Přístup do administrace byl odebrán.');}}
  catch(e){if(!c.signal.aborted&&!handleRequestError(e))setError(errorText(e));}
  finally{if(!c.signal.aborted){lock.current=false;setBusy(false);}}
 }
 return <Card aria-label="Administrátoři"><Stack><p>Vyhledejte registrovaný účet a vyberte sekce, které smí prohlížet a spravovat. Oprávnění zahrnuje čtení i změny v dané sekci.</p>
 <form onSubmit={e=>{e.preventDefault();void lookup();}}><Stack><Input label="E-mail uživatele" type="email" required maxLength={254} value={email} disabled={busy||dirty} onChange={e=>setEmail(e.target.value)}/><Actions><Button type="submit" disabled={busy||dirty}>Vyhledat účet</Button></Actions></Stack></form>
 {error?<p role="alert">{error}</p>:null}{notice?<p role="status">{notice}</p>:null}
 {selected?<Row><h3>{selected.name||selected.email}</h3><span>{selected.email}</span>{selected.owner?<p>Hlavní administrátor má plný přístup včetně správy ostatních administrátorů. Jeho přístup je chráněný.</p>:<>
 {(Object.keys(permissionLabels) as Permission[]).map(key=><CheckboxField key={key} label={permissionLabels[key]} checked={permissions.includes(key)} disabled={busy} onChange={e=>setPermissions(current=>e.target.checked?[...current,key]:current.filter(p=>p!==key))}/>)}
 <p>Správu administrátorů si ponechávají pouze hlavní administrátoři. Odebráním všech oprávnění zrušíte přístup; zákaznický účet zůstane zachovaný.</p>
 <Actions><Button disabled={!dirty||busy} onClick={()=>permissions.length?void save():setConfirm(true)}>Uložit oprávnění</Button><Button variant="secondary" disabled={busy} onClick={()=>{setSelected(null);setPermissions([]);setError('');}}>Zrušit úpravy</Button></Actions></>}</Row>:null}
 <h3>Aktuální přístupy</h3>{!list?<p role="status">Načítání administrátorů…</p>:<>
 {[...list.owners,...list.items].map(user=><Row key={user.id}><strong>{user.name||user.email||'Odstraněný účet'}</strong><span>{user.email}</span><span>{user.owner?'Hlavní administrátor · plný přístup':user.permissions.length?user.permissions.map(p=>permissionLabels[p]).join(' · '):'Přístup odebrán'}</span>{!user.owner?<Actions><Button variant="secondary" disabled={busy||dirty||!user.email} onClick={()=>choose(user)}>Upravit oprávnění</Button></Actions>:null}</Row>)}
 {list.total>20||page>1?<Actions><Button disabled={busy||dirty||page===1} onClick={()=>setPage(p=>p-1)}>Předchozí administrátoři</Button><span>Strana {page}</span><Button disabled={busy||dirty||page*20>=list.total} onClick={()=>setPage(p=>p+1)}>Další administrátoři</Button></Actions>:null}
 </>}<Actions><Button variant="secondary" disabled={busy||dirty} onClick={()=>{setError('');setSelected(null);setRevision(x=>x+1);}}>Obnovit administrátory</Button></Actions>
 <Dialog open={confirm} title="Odebrat přístup do administrace?" description={selected?.email||''} onEscape={()=>setConfirm(false)}><Actions><Button onClick={()=>setConfirm(false)}>Ponechat přístup</Button><Button variant="secondary" onClick={()=>void save()}>Odebrat přístup</Button></Actions></Dialog>
 </Stack></Card>;
}
