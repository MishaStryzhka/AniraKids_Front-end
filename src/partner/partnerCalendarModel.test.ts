import { rentalsOnDay, fittingsOnDay } from './partnerCalendarModel';

test('counts rentals across month boundaries, including both rental days but not cancelled records', () => {
  const rental = {
    startDate: '2026-09-30T00:00:00.000Z',
    endDate: '2026-10-02T00:00:00.000Z',
    status: 'confirmed',
  };
  const records = [
    rental,
    { ...rental, status: 'cancelled' },
    { ...rental, status: 'expired' },
  ];
  expect(rentalsOnDay(records, '2026-09-30')).toEqual([rental]);
  expect(rentalsOnDay(records, '2026-10-01')).toEqual([rental]);
  expect(rentalsOnDay(records, '2026-10-02')).toEqual([rental]);
  expect(rentalsOnDay(records, '2026-10-03')).toEqual([]);
});

test('counts fitting appointments on their civil day, including payment review and completed appointments', () => {
  const records = [
    'pending',
    'review',
    'confirmed',
    'completed',
    'expired',
    'cancelled',
  ].map(status => ({ date: '2026-10-25', status }));
  expect(fittingsOnDay(records, '2026-10-25')).toHaveLength(4);
  expect(fittingsOnDay(records, '2026-10-24')).toEqual([]);
});
