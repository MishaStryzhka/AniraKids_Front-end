import {
  isVariantEditorDirty,
  normalizeVariantSize,
  projectDetailVariants,
  reconcileCreatedVariant,
  reconcileUnknownCreate,
  reconcileUpdatedVariant,
  sortAdminVariants,
  validateVariantSize,
  variantSizeErrorCopy,
} from './productVariantsModel';

const v=(id:string,size:string,sortOrder=0,createdAt='2026-01-01T00:00:00Z')=>({
  id,productId:'p1',size,sku:`SKU-${id}`,status:'active' as const,sortOrder,createdAt,updatedAt:createdAt,
});
test('normalizes only surrounding whitespace and preserves grouped literal/case',()=>{
  expect(normalizeVariantSize(' 98-104-110-116 ')).toBe('98-104-110-116');
  expect(normalizeVariantSize(' xs ')).toBe('xs');
});
test('validates empty max length duplicate and excludes edited own id',()=>{
  const variants=[v('a','98'),v('b','XS')];
  expect(variantSizeErrorCopy(validateVariantSize({value:'   ',variants}).error)).toBe('Zadejte velikost.');
  expect(variantSizeErrorCopy(validateVariantSize({value:'x'.repeat(41),variants}).error)).toBe('Velikost může mít maximálně 40 znaků.');
  expect(variantSizeErrorCopy(validateVariantSize({value:' 98 ',variants}).error)).toBe('Tato velikost už u produktu existuje.');
  expect(validateVariantSize({value:'98',variants,editingVariantId:'a'}).error).toBeNull();
  expect(validateVariantSize({value:'xs',variants}).error).toBeNull();
});
test('dirty add/edit ignores whitespace-only differences',()=>{
  const variants=[v('a','98-104')];
  expect(isVariantEditorDirty({target:{kind:'add'},sizeDraft:'   ',variants})).toBe(false);
  expect(isVariantEditorDirty({target:{kind:'add'},sizeDraft:' 110 ',variants})).toBe(true);
  expect(isVariantEditorDirty({target:{kind:'edit',variantId:'a'},sizeDraft:' 98-104 ',variants})).toBe(false);
  expect(isVariantEditorDirty({target:{kind:'edit',variantId:'a'},sizeDraft:'98-110',variants})).toBe(true);
});
test('projects inventory away and sorts by sortOrder then createdAt',()=>{
  const detail=[{...v('b','110',1,'2026-01-02T00:00:00Z'),inventory:[{id:'i'}]},{...v('a','98',1,'2026-01-01T00:00:00Z'),inventory:[]}];
  expect(projectDetailVariants(detail as any)).toEqual([
    expect.not.objectContaining({inventory:expect.anything()}),
    expect.not.objectContaining({inventory:expect.anything()}),
  ]);
  expect(sortAdminVariants(projectDetailVariants(detail as any)).map(x=>x.id)).toEqual(['a','b']);
});
test('create/update reconciliation trusts server variant and remains sorted',()=>{
  const variants=[v('a','98',2)];
  expect(reconcileCreatedVariant(variants,v('b','110',1)).map(x=>x.id)).toEqual(['b','a']);
  expect(reconcileUpdatedVariant([v('a','98',2),v('b','110',1)],v('a','104',0)).map(x=>[x.id,x.size])).toEqual([['a','104'],['b','110']]);
});
test('unknown create refresh distinguishes exact literal found from absent',()=>{
  const variants=[v('a','98-104')];
  expect(reconcileUnknownCreate({variants,attemptedSize:'98-104'})).toEqual({found:true,variant:variants[0]});
  expect(reconcileUnknownCreate({variants,attemptedSize:'98-104 '})).toEqual({found:false,variant:null});
});
