import {act,renderHook,waitFor} from '@testing-library/react';
import {getAdminReservationCalendar,type CalendarReservation} from '../api/reservationCalendar';
import {useReservationCalendar} from './useReservationCalendar';
jest.mock('../api/reservationCalendar',()=>({getAdminReservationCalendar:jest.fn()}));
const get=getAdminReservationCalendar as jest.MockedFunction<typeof getAdminReservationCalendar>;
const row:CalendarReservation={id:'r1',reservationNumber:'AK-1',status:'returned',rentalMode:'studio',startDate:'2026-10-01',endDate:'2026-10-02',occupiedThrough:'2026-10-04',customerName:'Jana',items:[]};
function deferred<T>(){let resolve!:(value:T)=>void,reject!:(error:unknown)=>void;const promise=new Promise<T>((yes,no)=>{resolve=yes;reject=no});return{promise,resolve,reject};}
const setup=()=>{const props={month:'2026-10',token:'first-token',revision:0,onAccessError:jest.fn(()=>false)};return{...renderHook(input=>useReservationCalendar(input),{initialProps:props}),props};};
beforeEach(()=>jest.clearAllMocks());
test('inclusive month GET succeeds; refresh hides stale data and failure offers no old items',async()=>{
 get.mockResolvedValue({items:[row]});const {result,rerender,props}=setup();await waitFor(()=>expect(result.current.kind).toBe('success'));
 expect(get).toHaveBeenCalledWith(expect.objectContaining({from:'2026-10-01',to:'2026-10-31',token:'first-token'}));
 const pending=deferred<{items:CalendarReservation[]}>();get.mockReturnValue(pending.promise);rerender({...props,revision:1});expect(result.current.kind).toBe('loading');expect('items' in result.current).toBe(false);
 await act(async()=>pending.reject(new Error('offline')));expect(result.current.kind).toBe('error');expect('items' in result.current).toBe(false);
});
test.each(['resolve','reject'] as const)('obsolete month %s cannot overwrite new success or escalate access',async outcome=>{
 const old=deferred<{items:CalendarReservation[]}>();get.mockReturnValueOnce(old.promise).mockResolvedValueOnce({items:[]});const {result,rerender,props}=setup();const signal=get.mock.calls[0][0].signal;
 rerender({...props,month:'2026-11'});await waitFor(()=>expect(result.current.kind).toBe('success'));expect(signal?.aborted).toBe(true);
 await act(async()=>outcome==='resolve'?old.resolve({items:[row]}):old.reject(new Error('stale access')));expect(result.current).toMatchObject({kind:'success',items:[]});expect(props.onAccessError).not.toHaveBeenCalled();
});
test('new auth identity immediately excludes prior successful items and owns late callbacks',async()=>{
 get.mockResolvedValueOnce({items:[row]});const {result,rerender,props}=setup();await waitFor(()=>expect(result.current).toMatchObject({kind:'success',items:[row]}));
 const second=deferred<{items:CalendarReservation[]}>();get.mockReturnValueOnce(second.promise);rerender({...props,token:'second-token'});expect(result.current.kind).toBe('loading');expect('items' in result.current).toBe(false);
 get.mockResolvedValueOnce({items:[]});rerender({...props,token:'third-token'});await waitFor(()=>expect(result.current).toMatchObject({kind:'success',items:[]}));await act(async()=>second.resolve({items:[row]}));expect(result.current).toMatchObject({kind:'success',items:[]});
});
test('unmounted requests abort and access errors are handled only for current ownership',async()=>{
 const pending=deferred<{items:CalendarReservation[]}>();get.mockReturnValue(pending.promise);const {unmount,props}=setup();const signal=get.mock.calls[0][0].signal;unmount();expect(signal?.aborted).toBe(true);await act(async()=>pending.reject(new Error('old 403')));expect(props.onAccessError).not.toHaveBeenCalled();
});
