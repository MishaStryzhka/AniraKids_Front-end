import {
  EMPTY_INVENTORY_CREATE_DRAFT,
  INVENTORY_CONDITION_LABEL,
  INVENTORY_STATUS_PRESENTATION,
  buildInventorySnapshot,
  buildInventorySnapshotFromProjection,
  canonicalInventoryCode,
  editInventoryConditions,
  inventoryEditBaseline,
  inventoryItemsForVariant,
  inventoryLifecycleActionsForStatus,
  inventoryLifecycleTarget,
  isInventoryCreateDirty,
  isInventoryEditDirty,
  sameItemDirtyCondition,
  deriveInventoryRiskMeta,
  reconcileLifecycleInventoryItem,
  normalizeInventoryCode,
  reconcileCreatedInventoryItem,
  reconcileUnknownInventoryCreate,
  reconcileUpdatedInventoryItem,
  serializeInventoryCreate,
  serializeInventoryPatch,
  validateInventoryCode,
  validateInventoryNotes,
} from './productInventoryModel';

const item=(id:string,variantId='v1',code='AK-001',condition:'excellent'|'good'|'fair'|'damaged'='good',status:'active'|'maintenance'|'retired'='active')=>({
  id,variantId,internalCode:code,status,condition,notes:'',createdAt:`2026-01-0${id==='i1'?1:2}T00:00:00Z`,
});
const variant=(id:string,inventory:any[])=>({id,productId:'p1',size:'98',status:'active',sortOrder:0,createdAt:'',updatedAt:'',inventory});

test('normalizes code only by trim and canonical comparison uppercases separately',()=>{
  expect(normalizeInventoryCode(' ak-01 ')).toBe('ak-01');
  expect(canonicalInventoryCode(' ak-01 ')).toBe('AK-01');
});
test.each([
  ['', 'empty'],['A','too-short'],['A'.repeat(81),'too-long'],['AK 01','invalid-pattern'],['-AK','invalid-pattern'],['AK--01','invalid-pattern'],
])('validates inventory code %j',(value,error)=>expect(validateInventoryCode(value)).toBe(error));
test.each(['AK','ak-001','A1-B2-C3'])('accepts approved inventory code pattern %s',value=>expect(validateInventoryCode(value)).toBeNull());
test('maps exact status and condition labels',()=>{
  expect(INVENTORY_STATUS_PRESENTATION).toEqual({
    active:{label:'Aktivní',tone:'success'},maintenance:{label:'V údržbě',tone:'warning'},retired:{label:'Vyřazený',tone:'neutral'},
  });
  expect(INVENTORY_CONDITION_LABEL).toEqual({excellent:'Výborný',good:'Dobrý',fair:'Uspokojivý',damaged:'Poškozený'});
  expect(editInventoryConditions('active')).not.toContain('damaged');
  expect(editInventoryConditions('maintenance')).toContain('damaged');
  expect(editInventoryConditions('retired')).toContain('damaged');
});
test('notes are optional but max 1000',()=>{
  expect(validateInventoryNotes('')).toBeNull();expect(validateInventoryNotes('x'.repeat(1000))).toBeNull();expect(validateInventoryNotes('x'.repeat(1001))).toBe('too-long');
});
test('dirty create and edit compare only approved fields',()=>{
  expect(isInventoryCreateDirty(EMPTY_INVENTORY_CREATE_DRAFT)).toBe(false);
  expect(isInventoryCreateDirty({...EMPTY_INVENTORY_CREATE_DRAFT,internalCode:' AK-1 '})).toBe(true);
  const baseline={condition:'good' as const,notes:''};
  expect(isInventoryEditDirty({...baseline},baseline)).toBe(false);
  expect(isInventoryEditDirty({condition:'fair',notes:''},baseline)).toBe(true);
  expect(isInventoryEditDirty({condition:'good',notes:'x'},baseline)).toBe(true);
});
test('create serializer trims code, preserves casing and never sends acquiredAt/status/variantId',()=>{
  const body=serializeInventoryCreate({internalCode:' ak-001 ',condition:'good',notes:''});
  expect(body).toEqual({internalCode:'ak-001',condition:'good'});
  expect(body).not.toHaveProperty('acquiredAt');expect(body).not.toHaveProperty('status');expect(body).not.toHaveProperty('variantId');
  expect(serializeInventoryCreate({internalCode:'AK-2',condition:'fair',notes:'note'})).toEqual({internalCode:'AK-2',condition:'fair',notes:'note'});
});
test('PATCH serializer sends changed subset only and never internal code/acquiredAt',()=>{
  const baseline={condition:'good' as const,notes:'old'};
  expect(serializeInventoryPatch({...baseline},baseline)).toBeNull();
  expect(serializeInventoryPatch({condition:'fair',notes:'old'},baseline)).toEqual({condition:'fair'});
  expect(serializeInventoryPatch({condition:'good',notes:''},baseline)).toEqual({notes:''});
});
test('snapshot projection captures inventory before Variant projection and sorts by stable identity',()=>{
  const i2=item('i2'),i1=item('i1');
  const snapshot=buildInventorySnapshot([variant('v1',[i2,i1]) as any,variant('v2',[]) as any]);
  expect(inventoryItemsForVariant(snapshot,'v1').map(x=>x.id)).toEqual(['i1','i2']);
  expect(inventoryItemsForVariant(snapshot,'v2')).toEqual([]);
  const projected=buildInventorySnapshotFromProjection({variantIds:['v2','v1'],inventoryByVariant:{v1:[i1],v2:[]}});
  expect(Object.keys(projected)).toEqual(['v2','v1']);
  expect(inventoryItemsForVariant(projected,'v1')).toEqual([i1]);
});
test('create/update reconciliation uses real item IDs and owning Variant only',()=>{
  let snapshot=buildInventorySnapshot([variant('v1',[item('i1')]) as any]);
  snapshot=reconcileCreatedInventoryItem(snapshot,item('i2') as any);
  expect(inventoryItemsForVariant(snapshot,'v1').map(x=>x.id)).toEqual(['i1','i2']);
  snapshot=reconcileUpdatedInventoryItem(snapshot,{...item('i1'),condition:'fair'} as any);
  expect(inventoryItemsForVariant(snapshot,'v1')[0].condition).toBe('fair');
});
test('unknown create reconciliation distinguishes target match, global-code conflict and absence',()=>{
  const snapshot=buildInventorySnapshot([variant('v1',[item('i1','v1','AK-1')]) as any,variant('v2',[item('i2','v2','AK-2')]) as any]);
  const attempt={productId:'p1',variantId:'v1',internalCode:'ak-1',canonicalInternalCode:'AK-1',condition:'good' as const,notes:'n'};
  expect(reconcileUnknownInventoryCreate({snapshot,attempt}).kind).toBe('found-target');
  expect(reconcileUnknownInventoryCreate({snapshot,attempt:{...attempt,internalCode:'ak-2',canonicalInternalCode:'AK-2'}}).kind).toBe('found-other-variant');
  expect(reconcileUnknownInventoryCreate({snapshot,attempt:{...attempt,internalCode:'ak-3',canonicalInternalCode:'AK-3'}}).kind).toBe('absent');
});
test('edit baseline does not expose immutable internal code',()=>{
  expect(inventoryEditBaseline({...item('i1'),notes:undefined} as any)).toEqual({condition:'good',notes:''});
});


test('lifecycle action matrix is exact and retired is terminal',()=>{
  expect(inventoryLifecycleActionsForStatus('active').map(x=>x.action)).toEqual(['maintenance','retire']);
  expect(inventoryLifecycleActionsForStatus('maintenance').map(x=>x.action)).toEqual(['activate','retire']);
  expect(inventoryLifecycleActionsForStatus('retired')).toEqual([]);
  expect(inventoryLifecycleTarget('maintenance')).toBe('maintenance');
  expect(inventoryLifecycleTarget('activate')).toBe('active');
  expect(inventoryLifecycleTarget('retire')).toBe('retired');
});
test('same-item dirty condition blocks activation but notes-only/other-item do not',()=>{
  const editor={kind:'edit' as const,variantId:'v1',inventoryItemId:'i1'};
  expect(sameItemDirtyCondition({editor,editDraft:{condition:'fair',notes:''},editBaseline:{condition:'good',notes:''},variantId:'v1',inventoryItemId:'i1'})).toBe(true);
  expect(sameItemDirtyCondition({editor,editDraft:{condition:'good',notes:'typed'},editBaseline:{condition:'good',notes:''},variantId:'v1',inventoryItemId:'i1'})).toBe(false);
  expect(sameItemDirtyCondition({editor,editDraft:{condition:'fair',notes:''},editBaseline:{condition:'good',notes:''},variantId:'v1',inventoryItemId:'i2'})).toBe(false);
});
test('lifecycle reconciliation updates exact item only',()=>{
  const snapshot=buildInventorySnapshot([variant('v1',[item('i1'),item('i2','v1','AK-2')]) as any]);
  const next=reconcileLifecycleInventoryItem(snapshot,{...item('i1'),status:'maintenance'} as any);
  expect(next.v1.byId.i1.status).toBe('maintenance');
  expect(next.v1.byId.i2).toEqual(snapshot.v1.byId.i2);
});
test('lifecycle risk metadata separates editor and lifecycle pending/unresolved',()=>{
  expect(deriveInventoryRiskMeta({editorDirty:false,missingTargetDraft:false,editorPendingOrUnresolved:false,lifecyclePendingOrUnresolved:true})).toEqual({
    hasRisk:true,hasDraft:false,missingTargetDraft:false,editorPendingOrUnresolved:false,lifecyclePendingOrUnresolved:true,pendingOrUnresolved:true,
  });
  expect(deriveInventoryRiskMeta({editorDirty:true,missingTargetDraft:false,editorPendingOrUnresolved:false,lifecyclePendingOrUnresolved:false})).toEqual({
    hasRisk:true,hasDraft:true,missingTargetDraft:false,editorPendingOrUnresolved:false,lifecyclePendingOrUnresolved:false,pendingOrUnresolved:false,
  });
});
