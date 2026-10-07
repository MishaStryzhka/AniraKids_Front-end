import {reservationDayCounts,reservationsForDay,reservationStatusPresentation} from './reservationCalendarModel';
import type {CalendarReservation} from '../api/reservationCalendar';
const row:CalendarReservation={id:'r1',reservationNumber:'AK-001',status:'returned',rentalMode:'external',startDate:'2026-12-30',endDate:'2026-12-31',occupiedThrough:'2027-01-03',customerName:'Jana',items:[]};
test('server occupiedThrough governs cross-year cleaning; no fixed buffer is inferred',()=>{
 expect(reservationDayCounts([row],'2026-12-29')).toEqual({rental:0,cleaning:0});
 expect(reservationDayCounts([row],'2026-12-31')).toEqual({rental:1,cleaning:0});
 expect(reservationDayCounts([row],'2027-01-03')).toEqual({rental:0,cleaning:1});
 expect(reservationsForDay([row],'2027-01-03')).toEqual([row]);expect(reservationsForDay([row],'2027-01-04')).toEqual([]);
});
test('same-day occupiedThrough adds no synthetic cleaning day',()=>{
 expect(reservationDayCounts([{...row,occupiedThrough:row.endDate}],'2027-01-01')).toEqual({rental:0,cleaning:0});
});
test('returned/pending/future records remain visible and counts refer to reservations, not inventory availability',()=>{
 const items=[row,{...row,id:'r2',status:'pending',items:[{inventoryItemId:'i1',productName:'Sofia',size:'98'},{inventoryItemId:'i2',productName:'Anna',size:'104'}]}, {...row,id:'r3',status:'future'}];
 expect(reservationDayCounts(items,'2026-12-30')).toEqual({rental:3,cleaning:0});expect(reservationsForDay(items,'2026-12-30')).toHaveLength(3);
 expect(reservationStatusPresentation('returned').label).toBe('Vrácená');expect(reservationStatusPresentation('__proto__').label).toBe('Neznámý stav');
});
