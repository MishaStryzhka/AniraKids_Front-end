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
    missingVariantId:null,productMissing:false,editorDirty:false,riskMeta:{hasRisk:false,hasDraft:false,pendingOrUnresolved:false,missingTargetDraft:false},
    open:jest.fn(),discardCurrent:jest.fn(),cancel:jest.fn(),saveCreate:jest.fn(),saveEdit:jest.fn(),refresh:jest.fn(),scheduleFocus:jest.fn(),
    ...overrides,
  } as any;
}
test('renders all inventory statuses/conditions and omits acquired/retired metadata',()=>{
  render(<ProductInventoryItems variant={variant} controller={controller()} onRequestOpen={jest.fn()}/>);
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
  render(<ProductInventoryItems variant={variant} controller={controller({snapshot:{v1:{order:[],byId:{}}}})} onRequestOpen={jest.fn()}/>);
  expect(screen.getByText('Pro velikost 98-104 zatím nejsou žádné fyzické kusy')).toBeInTheDocument();
  expect(screen.getByText('Přidejte první fyzický kus této velikosti.')).toBeInTheDocument();
  expect(screen.getAllByRole('button',{name:'Přidat fyzický kus'}).length).toBeGreaterThan(0);
});
test('create editor defaults to Dobrý, excludes damaged and exposes approved helpers',()=>{
  const c=controller({snapshot:{v1:{order:[],byId:{}}},activeEditor:{kind:'add',variantId:'v1'}});
  render(<ProductInventoryItems variant={variant} controller={c} onRequestOpen={jest.fn()}/>);
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
  render(<ProductInventoryItems variant={variant} controller={c} onRequestOpen={jest.fn()}/>);
  expect(screen.getByText('AK-001-LONG-CODE')).toBeInTheDocument();
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
  render(<ProductInventoryItems variant={variant} controller={c} onRequestOpen={jest.fn()}/>);
  expect(screen.getByRole('option',{name:'Poškozený'})).toBeInTheDocument();
  expect(screen.getByRole('button',{name:'Uložit změny'})).toBeEnabled();
});
test('Add/Edit actions delegate exact stable targets and no local modal exists',()=>{
  const open=jest.fn();
  render(<ProductInventoryItems variant={variant} controller={controller()} onRequestOpen={open}/>);
  fireEvent.click(screen.getAllByRole('button',{name:'Přidat fyzický kus'})[0]);
  expect(open.mock.calls[0][0]).toEqual({kind:'add',variantId:'v1'});
  fireEvent.click(screen.getAllByRole('button',{name:'Upravit'})[0]);
  expect(open.mock.calls[1][0]).toEqual({kind:'edit',variantId:'v1',inventoryItemId:'i1'});
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});
test('unknown create, missing target and damaged error use approved local recovery copy',()=>{
  const unknown={productId:'p1',variantId:'v1',internalCode:'AK-9',canonicalInternalCode:'AK-9',condition:'good' as const,notes:'memo'};
  const c=controller({activeEditor:{kind:'add',variantId:'v1'},unknownCreate:unknown,refreshReason:'unknown-create',riskMeta:{hasRisk:true,hasDraft:true,pendingOrUnresolved:true,missingTargetDraft:false}});
  const {rerender}=render(<ProductInventoryItems variant={variant} controller={c} onRequestOpen={jest.fn()}/>);
  expect(screen.getByText('Výsledek přidání fyzického kusu není potvrzený')).toBeInTheDocument();
  expect(screen.getByRole('button',{name:'Načíst aktuální fyzické kusy'})).toBeEnabled();
  rerender(<ProductInventoryItems variant={variant} controller={controller({activeEditor:{kind:'edit',variantId:'v1',inventoryItemId:'i1'},editIdentity:item('i1'),editDraft:{condition:'fair',notes:'x'},editBaseline:{condition:'good',notes:''},damagedError:true})} onRequestOpen={jest.fn()}/>);
  expect(screen.getByText('Poškozený stav nelze uložit')).toBeInTheDocument();
});
