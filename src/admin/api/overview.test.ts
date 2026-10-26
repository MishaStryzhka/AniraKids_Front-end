jest.mock('axios',()=>({__esModule:true,default:{create:()=>({})}}));
import {parseAdminOverview} from './overview';
const empty={total:0,items:[]};
const fixture={today:'2026-10-26',loadedAt:'2026-10-26T20:00:00Z',pickups:empty,returns:empty,pending:empty,deposits:empty,unpaid:0,overdue:0,maintenance:0,drafts:0};
const row={id:'a',number:'ZK-123',name:'Guest',product:'Dress',date:'2026-10-27',time:'09:00',status:'review'};
test('fitting overview is validated independently and old/restricted responses do not invent counts',()=>{
 expect(parseAdminOverview(fixture).fittings).toBeNull();
 expect(parseAdminOverview({...fixture,fittings:null}).fittings).toBeNull();
 expect(parseAdminOverview({...fixture,fittings:{review:{total:1,items:[row]},pending:empty,today:empty}}).fittings?.review.items[0]).toEqual(row);
});
test.each([{...row,time:'25:00'},{...row,status:'completed'},{...row,date:'not-a-date'}])('rejects malformed fitting rows',invalid=>{
 expect(()=>parseAdminOverview({...fixture,fittings:{review:{total:1,items:[invalid]},pending:empty,today:empty}})).toThrow();
});
test('rejects partial fitting responses and incorrect counts',()=>{
 expect(()=>parseAdminOverview({...fixture,fittings:{review:empty}})).toThrow();
 expect(()=>parseAdminOverview({...fixture,fittings:{review:{total:0,items:[row]},pending:empty,today:empty}})).toThrow();
});
