import {distinctPhotoIds,isOrderDirty,moveId,reconcileMediaDrafts,validateAlt} from './productMediaModel';
const p=(id:string)=>({publicId:id,url:'https://img/'+id,alt:id});
test('reconcile preserves ALT drafts and order only for same membership',()=>{const d={altById:{a:'draft',gone:'x'},orderIds:['b','a']};expect(reconcileMediaDrafts(d,[p('a'),p('b')])).toEqual({altById:{a:'draft'},orderIds:['b','a']});expect(reconcileMediaDrafts(d,[p('a'),p('c')]).orderIds).toEqual(['a','c'])});
test('order and distinct helpers are deterministic',()=>{expect(moveId(['a','b'],'b',-1)).toEqual(['b','a']);expect(isOrderDirty([p('a'),p('b')],['b','a'])).toBe(true);expect(distinctPhotoIds([p('a'),p('a'),p('b')])).toEqual(['a','b'])});
test('ALT validation trims and caps 180',()=>{expect(validateAlt('   ')).toMatch(/povinný/);expect(validateAlt('x'.repeat(181))).toMatch(/180/);expect(validateAlt(' ok ')).toBeNull()});
