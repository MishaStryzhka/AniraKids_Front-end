import {adminApiClient,buildAdminRequestConfig} from './client';
import {getAdminReservationCalendar,parseReservationCalendarResponse} from './reservationCalendar';
import {AdminApiError} from './errors';
jest.mock('./client',()=>({adminApiClient:{get:jest.fn()},buildAdminRequestConfig:jest.fn(()=>({baseURL:'https://v2.test/api/v2',headers:{Authorization:'Bearer token'}}))}));
jest.mock('axios',()=>({__esModule:true,default:{isCancel:()=>false},AxiosError:class extends Error{}}));
const row={id:'r1',reservationNumber:'AK-2026-001',status:'confirmed',rentalMode:'external',startDate:'2026-10-30',endDate:'2026-10-31',occupiedThrough:'2026-11-03',customerName:'Jana Nováková',items:[{inventoryItemId:'i1',productName:'Šaty Sofia',size:'98'}]};
const get=adminApiClient.get as jest.Mock;
beforeEach(()=>{jest.clearAllMocks();(buildAdminRequestConfig as jest.Mock).mockReturnValue({baseURL:'https://v2.test/api/v2',headers:{Authorization:'Bearer token'}});});
test('authenticated cancellable GET sends only inclusive from/to and parses the narrow response',async()=>{
 get.mockResolvedValue({data:{items:[{...row,ignored:'extra'}],count:1}});const signal=new AbortController().signal;
 expect(await getAdminReservationCalendar({token:'token',from:'2026-10-01',to:'2026-10-31',signal})).toEqual({items:[row]});
 expect(get).toHaveBeenCalledWith('/admin/reservations/calendar',{baseURL:'https://v2.test/api/v2',headers:{Authorization:'Bearer token'},params:{from:'2026-10-01',to:'2026-10-31'}});
 expect(buildAdminRequestConfig).toHaveBeenCalledWith('token',signal);
});
test.each(['pending','confirmed','prepared','rented','returned'])('accepts server blocking status %s without deriving availability or pending expiry',status=>{
 const value={...row,status,...(status==='pending'?{expiresAt:'2026-10-30T12:15:00Z'}:{})};expect(parseReservationCalendarResponse({items:[value]})).toEqual({items:[value]});
});
test.each([null,{}, {items:null},{items:[{...row,status:null}]},{items:[{...row,endDate:'2026-02-30'}]},{items:[{...row,occupiedThrough:'2026-10-29'}]},{items:[{...row,items:[{}]}]},{items:[row,row]},{items:[{...row,customerName:null}]},{items:[{...row,expiresAt:'invalid'}]}])('malformed data fails closed rather than showing an empty/free calendar (%j)',value=>{
 expect(()=>parseReservationCalendarResponse(value)).toThrow(AdminApiError);
});
test('genuine empty response is accepted; invalid range never calls the API',async()=>{
 expect(parseReservationCalendarResponse({items:[]})).toEqual({items:[]});
 await expect(getAdminReservationCalendar({token:'token',from:'2026-02-30',to:'2026-03-01'})).rejects.toMatchObject({code:'ADMIN_CALENDAR_INVALID_RANGE'});expect(get).not.toHaveBeenCalled();
});
test('typed access errors remain typed for existing boundary',async()=>{
 const error=new AdminApiError({status:403,code:'ADMIN_FORBIDDEN',kind:'forbidden',message:'raw'});get.mockRejectedValue(error);
 await expect(getAdminReservationCalendar({token:'token',from:'2026-10-01',to:'2026-10-31'})).rejects.toBe(error);
});

test('future non-empty status remains visible for safe presentation fallback',()=>expect(parseReservationCalendarResponse({items:[{...row,status:'future_status'}]}).items[0].status).toBe('future_status'));
