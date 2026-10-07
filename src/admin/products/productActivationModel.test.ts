import {activationRequirementCopy,parseActivationRequirements,isReadinessStale,usableActivationMetadata,genericRequirementCopy} from './productActivationModel';

test('all twelve known server requirements use canonical order and approved copy',()=>{
 const keys=Object.keys(activationRequirementCopy);
 const requirements=parseActivationRequirements([...keys].reverse());
 expect(requirements.map(x=>x.key)).toEqual(keys);
 expect(requirements.map(x=>x.copy)).toEqual(Object.values(activationRequirementCopy));
 expect(requirements).toHaveLength(12);
});
test('unknown keys retain their server order and cannot read Object prototype properties',()=>{
 expect(parseActivationRequirements(['new_z','name','__proto__','new_a','name'])).toEqual([
  {key:'name',known:true,copy:activationRequirementCopy.name},
  ...['new_z','__proto__','new_a'].map(key=>({key,known:false,copy:genericRequirementCopy})),
 ]);
});
test.each([undefined,null,[],{},'name',[null,2,' ']])('malformed details remain one anonymous unmet requirement (%j)',value=>{
 expect(parseActivationRequirements(value)).toEqual([{key:null,known:false,copy:genericRequirementCopy}]);
});
test('valid mixed details keep keys plus one anonymous fallback',()=>{
 expect(parseActivationRequirements(['photos',null,'unknown',''])).toEqual([
  {key:'photos',known:true,copy:activationRequirementCopy.photos},
  {key:'unknown',known:false,copy:genericRequirementCopy},
  {key:null,known:false,copy:genericRequirementCopy},
 ]);
});
test('revision and supersession are monotonic history, not a local readiness engine',()=>{
 const result={attemptId:1,requirements:parseActivationRequirements(['name']),contextRevisionAtAttempt:2,superseded:false};
 expect(isReadinessStale(result,2)).toBe(false);
 expect(isReadinessStale(result,3)).toBe(true);
 expect(isReadinessStale({...result,superseded:true},2)).toBe(true);
});
test.each([{id:'other',status:'active',seoNoIndex:false},{id:'p1',status:'invalid',seoNoIndex:false},{id:'p1',status:'active'},null])('metadata fails closed (%j)',value=>expect(usableActivationMetadata(value,'p1')).toBe(false));
