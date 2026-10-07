import {
  contactErrors,
  initialDraft,
  isUuid,
  loadBooking,
  MAX_ENVELOPE_LENGTH,
  newAttempt,
  parseStored,
  persistBooking,
  reservationBody,
  selectionErrors,
  SESSION_KEY,
} from './bookingModel';
import { body, product, quote, receipt } from './bookingFixtures';
Object.defineProperty(globalThis, 'crypto', {
  value: require('crypto').webcrypto,
  configurable: true,
});
beforeEach(() => sessionStorage.clear());
test('date-only rules accept inclusive leap day and reject past/reversed/invalid dates', () => {
  expect(
    selectionErrors(
      { ...quote, startDate: '2028-02-29', endDate: '2028-02-29' },
      '2028-02-29'
    )
  ).toEqual({});
  expect(
    selectionErrors({ ...quote, startDate: '2027-02-29' }, '2027-02-01')
  ).toHaveProperty('startDate');
  expect(
    selectionErrors({ ...quote, startDate: '2030-10-06' }, '2030-10-07')
  ).toHaveProperty('startDate');
  expect(
    selectionErrors({ ...quote, endDate: '2030-10-09' }, '2030-10-07')
  ).toHaveProperty('endDate');
});
test('customer limits, normalized body and notes are enforced before dispatch', () => {
  const draft = {
    ...initialDraft(product),
    selection: quote,
    contact: {
      ...body.customer,
      firstName: ' Jana ',
      email: 'JANA@example.test ',
      notes: ' text ',
    },
  };
  expect(reservationBody(draft)).toMatchObject({
    customer: { firstName: 'Jana', email: 'jana@example.test' },
    notes: 'text',
  });
  expect(
    contactErrors({
      ...draft.contact,
      firstName: 'a'.repeat(101),
      email: 'bad',
      phone: '1234',
      notes: 'x'.repeat(1501),
    })
  ).toEqual(
    expect.objectContaining({
      firstName: expect.any(String),
      email: expect.any(String),
      phone: expect.any(String),
      notes: expect.any(String),
    })
  );
});
test('attempt survives reload unchanged and is never expired based on current dates', () => {
  const attempt = newAttempt({
    ...body,
    startDate: '2020-01-01',
    endDate: '2020-01-02',
  });
  expect(isUuid(attempt.key)).toBe(true);
  persistBooking(attempt);
  expect(loadBooking()).toEqual(attempt);
  expect(parseStored(sessionStorage.getItem(SESSION_KEY)!)).toEqual(attempt);
});
test('only sanitized public receipt replaces customer attempt', () => {
  persistBooking(newAttempt(body));
  persistBooking({ version: 1, kind: 'receipt', receipt });
  const raw = sessionStorage.getItem(SESSION_KEY)!;
  expect(raw).not.toContain(body.customer.email);
  expect(loadBooking()).toEqual({ version: 1, kind: 'receipt', receipt });
  persistBooking(null);
  expect(loadBooking()).toBeNull();
});
test.each([
  'bad',
  JSON.stringify({ version: 9 }),
  JSON.stringify({ version: 1, kind: 'attempt', key: 'bad', body }),
  ' '.repeat(MAX_ENVELOPE_LENGTH + 1),
])(
  'corrupted or oversized saved work blocks instead of silently clearing %#',
  raw => {
    sessionStorage.setItem(SESSION_KEY, raw);
    expect(loadBooking).toThrow();
    expect(sessionStorage.getItem(SESSION_KEY)).toBe(raw);
  }
);
