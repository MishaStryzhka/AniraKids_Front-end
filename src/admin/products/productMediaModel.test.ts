import {distinctPhotoIds,isOrderDirty,moveId,reconcileMediaDrafts,validateAlt} from './productMediaModel';

const p=(id:string)=>({publicId:id,url:'https://img/'+id,alt:id});

test('clean local order follows canonical same-membership order',()=>{
 const result=reconcileMediaDrafts({previousPhotos:[p('a'),p('b')],previousDrafts:{altById:{a:'draft'},orderIds:['a','b']},nextPhotos:[p('b'),p('a')]});
 expect(result.drafts.orderIds).toEqual(['b','a']);
 expect(result.drafts.altById).toEqual({a:'draft'});
 expect(result.membershipChanged).toBe(false);
});

test('dirty local order survives same membership for review',()=>{
 const result=reconcileMediaDrafts({previousPhotos:[p('a'),p('b')],previousDrafts:{altById:{},orderIds:['b','a']},nextPhotos:[p('a'),p('b')]});
 expect(result.drafts.orderIds).toEqual(['b','a']);
});

test('membership change rebuilds order and reports missing ALT target',()=>{
 const result=reconcileMediaDrafts({previousPhotos:[p('a'),p('b')],previousDrafts:{altById:{a:'draft',b:'missing'},orderIds:['b','a']},nextPhotos:[p('a'),p('c')]});
 expect(result.drafts).toEqual({altById:{a:'draft'},orderIds:['a','c']});
 expect(result.membershipChanged).toBe(true);
 expect(result.missingAltTargetIds).toEqual(['b']);
});

test('order and distinct helpers are deterministic',()=>{
 expect(moveId(['a','b'],'b',-1)).toEqual(['b','a']);
 expect(isOrderDirty([p('a'),p('b')],['b','a'])).toBe(true);
 expect(distinctPhotoIds([p('a'),p('a'),p('b')])).toEqual(['a','b']);
});

test('ALT validation trims and caps 180',()=>{
 expect(validateAlt('   ')).toMatch(/povinný/);
 expect(validateAlt('x'.repeat(181))).toMatch(/180/);
 expect(validateAlt(' ok ')).toBeNull();
});
