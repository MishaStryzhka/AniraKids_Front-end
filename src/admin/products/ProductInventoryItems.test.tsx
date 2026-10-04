import {fireEvent,render,screen} from '@testing-library/react';
import {ProductInventoryItems} from './ProductInventoryItems';
import type {ProductInventoryController} from './useProductInventoryController';
import type {AdminInventoryItem,AdminVariant} from '../api/products';
import {buildInventorySnapshot} from './productInventoryModel';

const item=(id:string,status:'active'|'maintenance'|'retired'='active',condition:'excellent'|'good'|'fair'|'damaged'='good'):AdminInventoryItem=>({
  id,variantId:'v1',internalCode:id==='i1'?'AK-001-LONG-CODE':'AK-002',status,condition,notes:id==='i1'?'Poznámka text':'',
});
const variant:AdminVariant={id:'v1',productId:'p1',size:'98-104',status:'active',sortOrder:0,createdAt:'',updatedAt:''};
function controller(overrides:Partial<ProductInventoryController>={}):ProductInventoryController{
  const seed=[{...variant,inventory:[item('i1'),item('i2','maintenance','damaged'),item('i3','retired','fair')]}] as any;
  return {
    snapshot:buildInventorySnapshot(seed),activeEditor:null,createDraft:{internalCode:'',condition:'good',notes:''},setCreateDraft:jest.fn(),
    editDraft:null,setEditDraft:jest.fn(),editBaseline:null,editIdentity:null,fieldErrors:{},submitError:null,damagedError:false,
    feedback:null,feedbackVariantId:null,operation:null,refreshing:false,refreshReason:null,unknownCreate:null,missingItemId:null,
    missingVariantId:null,productMissing:false,editorDirty:false,riskMeta:{hasRisk:false,hasDraft:false,missingTargetDraft:false,editorPendingOrUnresolved:false,lifecyclePendingOrUnresolved:false,pendingOrUnresolved:false},
    lifecycleOperationsByItem:{},unknownLifecycleByItem:{},lifecycleNoticeByItem:{},
    isLifecycleActionBlocked:jest.fn(()=>false),isBasicWriteBlocked:jest.fn(()=>false),isActivationBlocked:jest.fn(()=>false),
    open:jest.fn(),discardCurrent:jest.fn(),cancel:jest.fn(),saveCreate:jest.fn(),saveEdit:jest.fn(),refresh:jest.fn(),transitionLifecycle:jest.fn(),scheduleFocus:jest.fn(),
    ...overrides,
  } as any;
}
test('renders all inventory statuses/conditions and omits acquired/retired metadata',()=>{
  render(<ProductInventoryItems variant={variant} controller={controller()} onRequestOpen={jest.fn()} onRequestRetire={jest.fn()}/>);
  expect(screen.getByRole('heading',{name:'Fyzické kusy',level:3})).toBeInTheDocument();
  expect(screen.getByText('Aktivní')).toBeInTheDocument();
  expect(screen.getByText('V údržbě')).toBeInTheDocument();
  expect(screen.getByText('Vyřazený')).toBeInTheDocument();
  expect(screen.getByText('Dobrý')).toBeInTheDocument();
  expect(screen.getByText('Poškozený')).toBeInTheDocument();
  expect(screen.getByText('Uspokojivý')).toBeInTheDocument();
  expect(screen.queryByText(/acquired/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/retiredAt/i)).not.toBeInTheDocument();
});
test('empty state is per Variant and keeps Add available',()=>{
  render(<ProductInventoryItems variant={variant} controller={controller({snapshot:{v1:{order:[],byId:{}}}})} onRequestOpen={jest.fn()} onRequestRetire={jest.fn()}/>);
  expect(screen.getByText('Pro velikost 98-104 zatím nejsou žádné fyzické kusy')).toBeInTheDocument();
  expect(screen.getByText('Přidejte první fyzický kus této velikosti.')).toBeInTheDocument();
  expect(screen.getAllByRole('button',{name:'Přidat fyzický kus'}).length).toBeGreaterThan(0);
});
test('create editor defaults to Dobrý, excludes damaged and exposes approved helpers',()=>{
  const c=controller({snapshot:{v1:{order:[],byId:{}}},activeEditor:{kind:'add',variantId:'v1'}});
  render(<ProductInventoryItems variant={variant} controller={c} onRequestOpen={jest.fn()} onRequestRetire={jest.fn()}/>);
  expect(screen.getByLabelText('Interní kód')).toBeInTheDocument();
  expect(screen.getByLabelText('Stav kusu')).toHaveValue('good');
  expect(screen.queryByRole('option',{name:'Poškozený'})).not.toBeInTheDocument();
  expect(screen.getByText(/Unikátní kód fyzického kusu/)).toBeInTheDocument();
  expect(screen.getByText(/Nový fyzický kus bude vytvořen jako Aktivní/)).toBeInTheDocument();
});
test('active edit is read-only for identity/status, excludes damaged and disables clean Save',()=>{
  const c=controller({
    activeEditor:{kind:'edit',variantId:'v1',inventoryItemId:'i1'},
    editIdentity:item('i1'),editDraft:{condition:'good',notes:'Poznámka text'},editBaseline:{condition:'good',notes:'Poznámka text'},
  });
  render(<ProductInventoryItems variant={variant} controller={c} onRequestOpen={jest.fn()} onRequestRetire={jest.fn()}/>);
  expect(screen.getAllByText('AK-001-LONG-CODE').length).toBeGreaterThanOrEqual(1);
  expect(screen.getAllByText('Aktivní').length).toBeGreaterThan(0);
  expect(screen.queryByLabelText('Interní kód')).not.toBeInTheDocument();
  expect(screen.queryByRole('option',{name:'Poškozený'})).not.toBeInTheDocument();
  expect(screen.getByRole('button',{name:'Uložit změny'})).toBeDisabled();
});
test('maintenance edit allows damaged and reports dirty Save enabled',()=>{
  const maintenance={...item('i2','maintenance','good'),notes:''};
  const c=controller({
    activeEditor:{kind:'edit',variantId:'v1',inventoryItemId:'i2'},editIdentity:maintenance,
    editDraft:{condition:'damaged',notes:''},editBaseline:{condition:'good',notes:''},
  });
  render(<ProductInventoryItems variant={variant} controller={c} onRequestOpen={jest.fn()} onRequestRetire={jest.fn()}/>);
  expect(screen.getByRole('option',{name:'Poškozený'})).toBeInTheDocument();
  expect(screen.getByRole('button',{name:'Uložit změny'})).toBeEnabled();
});
test('Add/Edit actions delegate exact stable targets and no local modal exists',()=>{
  const open=jest.fn();
  render(<ProductInventoryItems variant={variant} controller={controller()} onRequestOpen={open} onRequestRetire={jest.fn()}/>);
  fireEvent.click(screen.getAllByRole('button',{name:'Přidat fyzický kus'})[0]);
  expect(open.mock.calls[0][0]).toEqual({kind:'add',variantId:'v1'});
  fireEvent.click(screen.getAllByRole('button',{name:'Upravit'})[0]);
  expect(open.mock.calls[1][0]).toEqual({kind:'edit',variantId:'v1',inventoryItemId:'i1'});
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});
test('unknown create, missing target and damaged error use approved local recovery copy',()=>{
  const unknown={productId:'p1',variantId:'v1',internalCode:'AK-9',canonicalInternalCode:'AK-9',condition:'good' as const,notes:'memo'};
  const c=controller({activeEditor:{kind:'add',variantId:'v1'},unknownCreate:unknown,refreshReason:'unknown-create',riskMeta:{hasRisk:true,hasDraft:true,missingTargetDraft:false,editorPendingOrUnresolved:true,lifecyclePendingOrUnresolved:false,pendingOrUnresolved:true}});
  const {rerender}=render(<ProductInventoryItems variant={variant} controller={c} onRequestOpen={jest.fn()} onRequestRetire={jest.fn()}/>);
  expect(screen.getByText('Výsledek přidání fyzického kusu není potvrzený')).toBeInTheDocument();
  expect(screen.getByRole('button',{name:'Načíst aktuální fyzické kusy'})).toBeEnabled();
  rerender(<ProductInventoryItems variant={variant} controller={controller({activeEditor:{kind:'edit',variantId:'v1',inventoryItemId:'i1'},editIdentity:item('i1'),editDraft:{condition:'fair',notes:'x'},editBaseline:{condition:'good',notes:''},damagedError:true})} onRequestOpen={jest.fn()} onRequestRetire={jest.fn()}/>);
  expect(screen.getByText('Poškozený stav nelze uložit')).toBeInTheDocument();
});


test('condition and notes errors are programmatically associated with stable helper/error IDs',()=>{
  const c=controller({
    activeEditor:{kind:'add',variantId:'v1'},
    snapshot:{v1:{order:[],byId:{}}},
    fieldErrors:{condition:'Chyba stavu kusu',notes:'Chyba poznámky'},
  });
  render(<ProductInventoryItems variant={variant} controller={c} onRequestOpen={jest.fn()} onRequestRetire={jest.fn()}/>);
  const condition=screen.getByLabelText('Stav kusu');
  const notes=screen.getByLabelText('Poznámka');
  expect(condition).toHaveAttribute('aria-invalid','true');
  expect(condition).toHaveAttribute('aria-describedby','inventory-v1-title-condition-help inventory-v1-title-condition-error');
  expect(document.getElementById('inventory-v1-title-condition-help')).toHaveTextContent(/Nový fyzický kus/);
  expect(document.getElementById('inventory-v1-title-condition-error')).toHaveTextContent('Chyba stavu kusu');
  expect(notes).toHaveAttribute('aria-invalid','true');
  expect(notes).toHaveAttribute('aria-describedby','inventory-v1-title-notes-help inventory-v1-title-notes-error');
  expect(document.getElementById('inventory-v1-title-notes-help')).toHaveTextContent('Volitelné. Maximálně 1000 znaků.');
  expect(document.getElementById('inventory-v1-title-notes-error')).toHaveTextContent('Chyba poznámky');
});

test('multiple Variant Inventory editors have no duplicate helper or error IDs',()=>{
  const variant2:AdminVariant={...variant,id:'v2',size:'110'};
  const c1=controller({
    activeEditor:{kind:'add',variantId:'v1'},snapshot:{v1:{order:[],byId:{}}},
    fieldErrors:{condition:'C1',notes:'N1'},
  });
  const c2=controller({
    activeEditor:{kind:'add',variantId:'v2'},snapshot:{v2:{order:[],byId:{}}},
    fieldErrors:{condition:'C2',notes:'N2'},
  });
  render(<><ProductInventoryItems variant={variant} controller={c1} onRequestOpen={jest.fn()} onRequestRetire={jest.fn()}/>
    <ProductInventoryItems variant={variant2} controller={c2} onRequestOpen={jest.fn()} onRequestRetire={jest.fn()}/></>);
  const ids=Array.from(document.querySelectorAll<HTMLElement>('[id^="inventory-v"]')).map(node=>node.id);
  expect(new Set(ids).size).toBe(ids.length);
  expect(document.getElementById('inventory-v1-title-condition-error')).toBeInTheDocument();
  expect(document.getElementById('inventory-v2-title-condition-error')).toBeInTheDocument();
  expect(document.getElementById('inventory-v1-title-notes-error')).toBeInTheDocument();
  expect(document.getElementById('inventory-v2-title-notes-error')).toBeInTheDocument();
});


test('missing Variant and InventoryItem recovery surfaces use approved Czech copy and never field-validation guidance',()=>{
  const add=controller({
    activeEditor:{kind:'add',variantId:'v1'},snapshot:{v1:{order:[],byId:{}}},
    createDraft:{internalCode:'AK-9',condition:'fair',notes:'memo'},
    missingVariantId:'v1',refreshReason:'missing-variant',
    riskMeta:{hasRisk:true,hasDraft:true,missingTargetDraft:true,editorPendingOrUnresolved:false,lifecyclePendingOrUnresolved:false,pendingOrUnresolved:false},
  });
  const view=render(<ProductInventoryItems variant={variant} controller={add} onRequestOpen={jest.fn()} onRequestRetire={jest.fn()}/>);
  expect(screen.getByText('Varianta už není dostupná')).toBeInTheDocument();
  expect(screen.getByText('Fyzický kus nelze přidat, protože tato varianta už nebyla nalezena.')).toBeInTheDocument();
  expect(screen.getByRole('button',{name:'Načíst aktuální fyzické kusy'})).toBeEnabled();
  expect(screen.queryByText('Fyzický kus se nepodařilo uložit. Zkontrolujte zadané údaje.')).not.toBeInTheDocument();

  const edit=controller({
    activeEditor:{kind:'edit',variantId:'v1',inventoryItemId:'i1'},editIdentity:item('i1'),
    editDraft:{condition:'fair',notes:'typed'},editBaseline:{condition:'good',notes:'Poznámka text'},
    missingItemId:'i1',refreshReason:'missing-item',
    riskMeta:{hasRisk:true,hasDraft:true,missingTargetDraft:true,editorPendingOrUnresolved:false,lifecyclePendingOrUnresolved:false,pendingOrUnresolved:false},
  });
  view.rerender(<ProductInventoryItems variant={variant} controller={edit} onRequestOpen={jest.fn()} onRequestRetire={jest.fn()}/>);
  expect(screen.getByText('Fyzický kus už není dostupný')).toBeInTheDocument();
  expect(screen.getByText('Změny nelze uložit, protože tento fyzický kus už nebyl nalezen.')).toBeInTheDocument();
  expect(screen.getByRole('button',{name:'Načíst aktuální fyzické kusy'})).toBeEnabled();
  expect(screen.queryByText('Fyzický kus se nepodařilo uložit. Zkontrolujte zadané údaje.')).not.toBeInTheDocument();
});


test('renders exact lifecycle action matrix and retire delegates page intent without local Dialog',()=>{
  const retire=jest.fn();
  const {rerender}=render(<ProductInventoryItems variant={variant} controller={controller({snapshot:buildInventorySnapshot([{...variant,inventory:[item('i1','active','good')]}] as any)})} onRequestOpen={jest.fn()} onRequestRetire={retire}/>);
  expect(screen.getByRole('button',{name:'Přesunout do údržby'})).toBeInTheDocument();
  expect(screen.getByRole('button',{name:'Vyřadit'})).toBeInTheDocument();
  expect(screen.queryByRole('button',{name:'Aktivovat'})).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button',{name:'Vyřadit'}));
  expect(retire.mock.calls[0][0]).toEqual(expect.objectContaining({variantId:'v1',inventoryItemId:'i1',internalCode:'AK-001-LONG-CODE'}));
  expect(retire.mock.calls[0][0].trigger).toBeInstanceOf(HTMLElement);
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

  rerender(<ProductInventoryItems variant={variant} controller={controller({snapshot:buildInventorySnapshot([{...variant,inventory:[item('i1','maintenance','good')]}] as any)})} onRequestOpen={jest.fn()} onRequestRetire={jest.fn()}/>);
  expect(screen.getByRole('button',{name:'Aktivovat'})).toBeInTheDocument();
  expect(screen.getByRole('button',{name:'Vyřadit'})).toBeInTheDocument();
  expect(screen.queryByRole('button',{name:'Přesunout do údržby'})).not.toBeInTheDocument();

  rerender(<ProductInventoryItems variant={variant} controller={controller({snapshot:buildInventorySnapshot([{...variant,inventory:[item('i1','retired','good')]}] as any)})} onRequestOpen={jest.fn()} onRequestRetire={jest.fn()}/>);
  expect(screen.getByRole('button',{name:'Upravit'})).toBeInTheDocument();
  expect(screen.queryByRole('button',{name:'Aktivovat'})).not.toBeInTheDocument();
  expect(screen.queryByRole('button',{name:'Přesunout do údržby'})).not.toBeInTheDocument();
  expect(screen.queryByRole('button',{name:'Vyřadit'})).not.toBeInTheDocument();
});

test.each([
  ['maintenance','Přesouvání…','secondary'],
  ['activate','Aktivování…','secondary'],
  ['retire','Vyřazování…','destructive'],
] as const)('pending %s keeps exact visible label, aria-busy and disabled state',(action,label,_variant)=>{
  const status=action==='activate'?'maintenance':'active';
  const lifecycleOperationsByItem={i1:{generation:1,productId:'p1',variantId:'v1',inventoryItemId:'i1',sourceStatus:status,targetStatus:action==='activate'?'active':action==='maintenance'?'maintenance':'retired',action}};
  const c=controller({
    snapshot:buildInventorySnapshot([{...variant,inventory:[item('i1',status as any,'good')]}] as any),
    lifecycleOperationsByItem,
    isLifecycleActionBlocked:jest.fn(()=>true),
    riskMeta:{hasRisk:true,hasDraft:false,missingTargetDraft:false,editorPendingOrUnresolved:false,lifecyclePendingOrUnresolved:true,pendingOrUnresolved:true},
  });
  render(<ProductInventoryItems variant={variant} controller={c} onRequestOpen={jest.fn()} onRequestRetire={jest.fn()}/>);
  const button=screen.getByRole('button',{name:label});
  expect(button).toBeDisabled();expect(button).toHaveAttribute('aria-busy','true');
  expect(button.querySelector('[aria-hidden="true"]')).not.toBeNull();
});

test('same-item dirty condition disables Activate with exact helper; notes-only allows Activate',()=>{
  const maintenance=item('i2','maintenance','good');
  const blocked=controller({
    snapshot:buildInventorySnapshot([{...variant,inventory:[maintenance]}] as any),
    activeEditor:{kind:'edit',variantId:'v1',inventoryItemId:'i2'},editIdentity:maintenance,
    editDraft:{condition:'fair',notes:''},editBaseline:{condition:'good',notes:''},
    isActivationBlocked:jest.fn(()=>true),
  });
  const view=render(<ProductInventoryItems variant={variant} controller={blocked} onRequestOpen={jest.fn()} onRequestRetire={jest.fn()}/>);
  const activate=screen.getByRole('button',{name:'Aktivovat'});
  expect(activate).toBeDisabled();
  expect(activate).toHaveAttribute('aria-describedby',expect.stringContaining('activation-help'));
  expect(screen.getByText('Nejprve uložte nebo zrušte rozpracovanou změnu Stavu kusu.')).toBeInTheDocument();

  view.rerender(<ProductInventoryItems variant={variant} controller={controller({
    snapshot:buildInventorySnapshot([{...variant,inventory:[maintenance]}] as any),
    activeEditor:{kind:'edit',variantId:'v1',inventoryItemId:'i2'},editIdentity:maintenance,
    editDraft:{condition:'good',notes:'typed'},editBaseline:{condition:'good',notes:''},
    isActivationBlocked:jest.fn(()=>false),
  })} onRequestOpen={jest.fn()} onRequestRetire={jest.fn()}/>);
  expect(screen.getByRole('button',{name:'Aktivovat'})).toBeEnabled();
});

test.each([
  [{kind:'success',message:'Fyzický kus byl aktivován.'},'Fyzický kus byl aktivován.'],
  [{kind:'reservation-conflict'},'Provozní stav nelze změnit'],
  [{kind:'damaged-activation'},'Fyzický kus nelze aktivovat'],
  [{kind:'invalid-transition',recoverable:true},'Tuto změnu provozního stavu nelze provést'],
  [{kind:'invalid-id',recoverable:true},'Fyzický kus nelze změnit'],
  [{kind:'missing-item',recoverable:true},'Fyzický kus už není dostupný'],
  [{kind:'unknown',recoverable:true},'Výsledek změny provozního stavu není potvrzený'],
] as const)('renders lifecycle notice %j with approved item-local copy',(notice,text)=>{
  render(<ProductInventoryItems variant={variant} controller={controller({lifecycleNoticeByItem:{i1:notice as any}})} onRequestOpen={jest.fn()} onRequestRetire={jest.fn()}/>);
  expect(screen.getByText(text)).toBeInTheDocument();
  if('recoverable' in notice)expect(screen.getByRole('button',{name:'Načíst aktuální fyzické kusy'})).toBeInTheDocument();
});

test('long internal code remains wrap-safe and actions stay outside Basic editor',()=>{
  const long={...item('i1'),internalCode:'A'.repeat(80)};
  render(<ProductInventoryItems variant={variant} controller={controller({snapshot:buildInventorySnapshot([{...variant,inventory:[long]}] as any)})} onRequestOpen={jest.fn()} onRequestRetire={jest.fn()}/>);
  expect(screen.getByText('A'.repeat(80))).toBeInTheDocument();
  expect(screen.getByRole('button',{name:'Přesunout do údržby'})).toBeInTheDocument();
});
