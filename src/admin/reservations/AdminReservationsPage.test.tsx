import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import {
  listAdminReservations,
  getAdminReservationDetail,
} from '../api/reservations';
import { AdminApiError } from '../api/errors';
import { AdminReservationsPage } from './AdminReservationsPage';
import { AdminReservationDetailPage } from './AdminReservationDetailPage';
import {
  reservationDetailFixture as detail,
  reservationListResponseFixture as list,
} from './reservationFixtures';
jest.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({ token: 'token' }),
}));
const mockAccess = jest.fn(() => false);
jest.mock('../auth/AdminAccessBoundary', () => ({
  useAdminAccess: () => ({ handleRequestError: mockAccess }),
}));
jest.mock('../api/client', () => ({
  adminApiClient: { get: jest.fn() },
  buildAdminRequestConfig: jest.fn(),
}));
jest.mock('axios', () => ({
  __esModule: true,
  default: { isCancel: () => false },
  AxiosError: class extends Error {},
}));
jest.mock('../api/reservations', () => ({
  ...jest.requireActual('../api/reservations'),
  listAdminReservations: jest.fn(),
  getAdminReservationDetail: jest.fn(),
}));
const getList = listAdminReservations as jest.MockedFunction<
    typeof listAdminReservations
  >,
  getDetail = getAdminReservationDetail as jest.MockedFunction<
    typeof getAdminReservationDetail
  >;
function Location() {
  const location = useLocation();
  return (
    <output data-testid="location">
      {location.pathname}
      {location.search}
    </output>
  );
}
function setup(path = '/admin/rezervace', state?: unknown) {
  return render(
    <MemoryRouter
      initialEntries={[
        {
          pathname: path.split('?')[0],
          search: path.split('?')[1] ? '?' + path.split('?')[1] : '',
          state,
        },
      ]}
    >
      <Location />
      <Routes>
        <Route path="/admin/rezervace" element={<AdminReservationsPage />} />
        <Route
          path="/admin/rezervace/:reservationId"
          element={<AdminReservationDetailPage />}
        />
        <Route
          path="/admin/kalendar"
          element={<div>Calendar destination</div>}
        />
      </Routes>
    </MemoryRouter>
  );
}
beforeEach(() => {
  jest.clearAllMocks();
  getList.mockResolvedValue(list);
  getDetail.mockResolvedValue(detail);
  mockAccess.mockReturnValue(false);
});
test('search is submit-only and stays out of URL; list filters and q survive real detail/back navigation', async () => {
  setup();
  await screen.findByText('Počet rezervací: 1');
  fireEvent.change(screen.getByLabelText('Hledat rezervaci'), {
    target: { value: ' fixture@example.test ' },
  });
  fireEvent.change(screen.getByLabelText('Stav'), {
    target: { value: 'pending' },
  });
  expect(getList).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByRole('button', { name: 'Použít filtry' }));
  await waitFor(() =>
    expect(getList).toHaveBeenLastCalledWith(
      expect.objectContaining({
        query: expect.objectContaining({
          q: 'fixture@example.test',
          status: 'pending',
          page: 1,
        }),
      })
    )
  );
  expect(screen.getByTestId('location')).toHaveTextContent(
    '/admin/rezervace?status=pending'
  );
  expect(screen.getByTestId('location')).not.toHaveTextContent('fixture');
  await screen.findByText('Počet rezervací: 1');
  fireEvent.click(screen.getAllByRole('link', { name: 'AK-2026-001' })[0]);
  await screen.findByRole('heading', { name: 'AK-2026-001' });
  expect(getDetail).toHaveBeenCalledWith(
    expect.objectContaining({ reservationId: 'r1' })
  );
  fireEvent.click(screen.getByRole('link', { name: 'Zpět na rezervace' }));
  await screen.findByText('Počet rezervací: 1');
  expect(screen.getByLabelText('Hledat rezervaci')).toHaveValue(
    'fixture@example.test'
  );
  expect(screen.getByLabelText('Stav')).toHaveValue('pending');
  expect(screen.getByTestId('location')).toHaveTextContent(
    '/admin/rezervace?status=pending'
  );
});
test('initial inverted URL dates show validation without GET and correction recovers', async () => {
  setup('/admin/rezervace?from=2027-01-01&to=2026-12-31');
  expect(screen.getByRole('alert')).toHaveTextContent(
    'Datum od nesmí být pozdější než datum do.'
  );
  expect(getList).not.toHaveBeenCalled();
  expect(screen.queryByText('Načítání rezervací…')).not.toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Do'), {
    target: { value: '2027-01-31' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Použít filtry' }));
  await screen.findByText('Počet rezervací: 1');
  expect(getList).toHaveBeenCalledTimes(1);
  expect(getList).toHaveBeenLastCalledWith(
    expect.objectContaining({
      query: expect.objectContaining({ from: '2027-01-01', to: '2027-01-31' }),
    })
  );
});
test('page999 is not a globally empty search and first-page recovery preserves filters', async () => {
  getList.mockResolvedValueOnce({
    items: [],
    pagination: { page: 999, limit: 20, total: 21, pages: 2 },
  });
  setup('/admin/rezervace?status=returned&page=999');
  await screen.findByText('Na této stránce nejsou žádné rezervace');
  expect(
    screen.queryByText('Žádné rezervace neodpovídají vyhledávání nebo filtrům')
  ).not.toBeInTheDocument();
  fireEvent.click(
    screen.getByRole('button', { name: 'Přejít na první stránku' })
  );
  await screen.findByText('Počet rezervací: 1');
  expect(screen.getByTestId('location')).toHaveTextContent(
    '/admin/rezervace?status=returned'
  );
});
test('list failure is a recoverable error, not empty data or raw server details', async () => {
  getList.mockRejectedValueOnce(new Error('private server text'));
  setup();
  const error = await screen.findByRole('alert');
  expect(error).toHaveTextContent('Rezervace se nepodařilo načíst');
  expect(screen.queryByText('private server text')).not.toBeInTheDocument();
  fireEvent.click(within(error).getByRole('button', { name: 'Zkusit znovu' }));
  await screen.findByText('Počet rezervací: 1');
  fireEvent.click(screen.getByRole('button', { name: 'Vyčistit filtry' }));
  await waitFor(() => expect(getList).toHaveBeenCalledTimes(3));
});
test('detail renders authoritative Kč, snapshots, expiration and missing current inventory without availability claims', async () => {
  setup('/admin/rezervace/r1', { reservationBack: { kind: 'calendar' } });
  await screen.findByRole('heading', { name: 'AK-2026-001' });
  expect(screen.getByText('Čeká na potvrzení')).toBeInTheDocument();
  expect(screen.getByText('Čekání vypršelo')).toBeInTheDocument();
  expect(
    screen.getByText('Aktuální údaje o fyzickém kusu nejsou k dispozici.')
  ).toBeInTheDocument();
  expect(screen.getByText('Slavnostní šaty Sofia')).toBeInTheDocument();
  expect(screen.getByText('1 700 Kč', { exact: true })).toBeInTheDocument();
  expect(screen.queryByText('Obsazeno do')).not.toBeInTheDocument();
  expect(
    screen.getByRole('link', { name: 'Zpět na kalendář' })
  ).toHaveAttribute('href', '/admin/kalendar');
  expect(
    screen.getByRole('button', { name: 'Potvrdit rezervaci' })
  ).toBeEnabled();
  expect(
    screen.queryByRole('button', { name: /platbu/i })
  ).not.toBeInTheDocument();
});
test('cancelled/refunded detail preserves safe text and current inventory facts', async () => {
  getDetail.mockResolvedValueOnce({
    ...detail,
    status: 'cancelled',
    paymentStatus: 'refunded',
    pendingExpired: false,
    notes: '<script>never run</script>',
    cancellationReason: 'Žádost zákaznice',
    cancelledAt: '2026-12-02T12:00:00Z',
    items: [
      {
        ...detail.items[0],
        inventoryCurrent: {
          internalCode: 'AK-I1',
          status: 'maintenance',
          condition: 'damaged',
        },
      },
    ],
  });
  setup('/admin/rezervace/r1', { returnTo: 'https://evil.test' });
  await screen.findByText('Zrušená');
  expect(screen.getByText('Vrácená platba')).toBeInTheDocument();
  expect(screen.getByText('<script>never run</script>')).toBeInTheDocument();
  expect(screen.getByText('V údržbě')).toBeInTheDocument();
  expect(
    screen.getByRole('link', { name: 'Zpět na rezervace' })
  ).toHaveAttribute('href', '/admin/rezervace');
});
test('detail404 has a safe back link; retryable malformed detail never renders a success section', async () => {
  getDetail.mockRejectedValueOnce(
    new AdminApiError({
      status: 404,
      code: 'NOT_FOUND',
      kind: 'unexpected',
      message: 'private',
    })
  );
  const view = setup('/admin/rezervace/missing');
  await screen.findByText('Rezervace nebyla nalezena');
  expect(
    screen.getByRole('link', { name: 'Zpět na rezervace' })
  ).toBeInTheDocument();
  view.unmount();
  getDetail.mockRejectedValueOnce(
    new AdminApiError({
      code: 'ADMIN_RESERVATION_INVALID_RESPONSE',
      kind: 'unexpected',
      message: 'private',
    })
  );
  setup('/admin/rezervace/r1');
  await screen.findByRole('alert');
  expect(screen.queryByText('Zákazník')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Zkusit znovu' }));
  await screen.findByRole('heading', { name: 'AK-2026-001' });
});
