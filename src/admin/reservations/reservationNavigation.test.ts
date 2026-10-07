import {
  reservationBackContext,
  reservationListBackLink,
  reservationSearchFromState,
} from './reservationNavigation';
jest.mock('../api/client', () => ({
  adminApiClient: { get: jest.fn() },
  buildAdminRequestConfig: jest.fn(),
}));
jest.mock('axios', () => ({
  __esModule: true,
  default: { isCancel: () => false },
  AxiosError: class extends Error {},
}));
test('only verified local routes are used for back context and customer search stays in navigation state', () => {
  const context = reservationBackContext({
    reservationBack: {
      kind: 'list',
      search: 'status=returned&page=2&q=private&returnTo=https://evil.test',
      q: ' Jana ',
    },
  });
  expect(reservationListBackLink(context)).toEqual({
    to: '/admin/rezervace?status=returned&page=2',
    state: { reservationSearch: 'Jana' },
  });
  for (const state of [
    { returnTo: 'https://evil.test' },
    { reservationBack: { kind: 'https://evil.test' } },
    { reservationBack: { kind: 'list', search: '', q: 'x'.repeat(201) } },
  ])
    expect(reservationListBackLink(reservationBackContext(state)).to).toBe(
      '/admin/rezervace'
    );
  expect(
    reservationBackContext({
      reservationBack: { kind: 'calendar', returnTo: 'https://evil.test' },
    })
  ).toEqual({ kind: 'calendar' });
  expect(reservationSearchFromState({ reservationSearch: 4 })).toBe('');
});
