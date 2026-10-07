import {addCalendarDays,calendarMonthRange,formatCalendarDay,isCalendarRange,isDateOnly,mondayWeekday,monthCalendarDays,pragueToday,shiftCalendarMonth} from './calendarDates';

test.each(['2026-02-29','2026-04-31','2026-2-01','2026-01-01T00:00:00Z','0000-01-01',null])('rejects invalid/non-canonical day %j',value=>expect(isDateOnly(value)).toBe(false));
test('leap days and calendar boundaries retain exact days',()=>{
 expect(isDateOnly('2024-02-29')).toBe(true);expect(isDateOnly('0099-01-01')).toBe(true);
 expect(calendarMonthRange('2024-02')).toEqual({from:'2024-02-01',to:'2024-02-29'});
 expect(calendarMonthRange('2026-02')).toEqual({from:'2026-02-01',to:'2026-02-28'});
 expect(shiftCalendarMonth('2026-12',1)).toBe('2027-01');expect(shiftCalendarMonth('2026-01',-1)).toBe('2025-12');
 expect(monthCalendarDays('2026-10')).toHaveLength(31);expect(mondayWeekday('2026-10-05')).toBe(0);
});
test('Prague current day respects summer/winter midnight rather than host timezone',()=>{
 expect(pragueToday(new Date('2026-07-07T22:30:00Z'))).toBe('2026-07-08');
 expect(pragueToday(new Date('2026-01-07T22:30:00Z'))).toBe('2026-01-07');
 expect(pragueToday(new Date('2026-01-07T23:30:00Z'))).toBe('2026-01-08');
});
test('civil arithmetic crosses DST without missing/duplicating a day',()=>{
 expect(addCalendarDays('2026-03-28',1)).toBe('2026-03-29');expect(addCalendarDays('2026-03-29',1)).toBe('2026-03-30');
 expect(addCalendarDays('2026-10-25',1)).toBe('2026-10-26');expect(formatCalendarDay('2026-03-29')).toContain('29. března 2026');
});
test('GET range bound is inclusive 366 days',()=>{
 expect(isCalendarRange('2024-01-01','2024-12-31')).toBe(true);expect(isCalendarRange('2024-01-01','2025-01-01')).toBe(false);
 expect(isCalendarRange('2026-01-01','2026-01-01')).toBe(true);expect(isCalendarRange('2026-01-02','2026-01-01')).toBe(false);
});
