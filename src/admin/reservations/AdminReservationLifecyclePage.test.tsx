import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom';
import { getAdminReservationDetail } from '../api/reservations';
import { changeAdminReservation } from '../api/reservationMutations';
import { AdminApiError } from '../api/errors';
import { AdminReservationDetailPage } from './AdminReservationDetailPage';
import { reservationDetailFixture as detail } from './reservationFixtures';
jest.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({ token: 'token' }),
}));
const mockAccess = jest.fn(() => false);
jest.mock('../auth/AdminAccessBoundary', () => ({
  useAdminAccess: () => ({ handleRequestError: mockAccess }),
}));
jest.mock('../api/reservations', () => ({
  getAdminReservationDetail: jest.fn(),
}));
jest.mock('../api/reservationMutations', () => ({
  changeAdminReservation: jest.fn(),
}));
jest.mock('axios', () => ({
  __esModule: true,
  default: { isCancel: () => false },
  AxiosError: class extends Error {},
}));
const get = getAdminReservationDetail as jest.MockedFunction<
    typeof getAdminReservationDetail
  >,
  mutate = changeAdminReservation as jest.MockedFunction<
    typeof changeAdminReservation
  >;
const receipt = {
  id: 'r1',
  reservationNumber: 'AK-2026-001',
  status: 'confirmed',
  paymentStatus: 'unpaid',
  pendingExpired: false,
};
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(yes => {
    resolve = yes;
  });
  return { promise, resolve };
}
function OtherRoute() {
  const navigate = useNavigate();
  return (
    <button onClick={() => navigate('/admin/rezervace/r2')}>
      Other reservation
    </button>
  );
}
const setup = () =>
  render(
    <MemoryRouter initialEntries={['/admin/rezervace/r1']}>
      <OtherRoute />
      <Routes>
        <Route
          path="/admin/rezervace/:reservationId"
          element={<AdminReservationDetailPage />}
        />
      </Routes>
    </MemoryRouter>
  );
beforeEach(() => {
  jest.clearAllMocks();
  get.mockResolvedValue(detail);
  mutate.mockResolvedValue(receipt);
  mockAccess.mockReturnValue(false);
});
test('expired pending can confirm; authoritative status changes action and receives focus', async () => {
  setup();
  const confirm = await screen.findByRole('button', {
    name: 'Potvrdit rezervaci',
  });
  expect(screen.getByText('Čekání vypršelo')).toBeInTheDocument();
  get.mockResolvedValueOnce({
    ...detail,
    status: 'confirmed',
    pendingExpired: false,
  });
  fireEvent.click(confirm);
  await screen.findByRole('button', { name: 'Připravit rezervaci' });
  expect(
    screen.queryByRole('button', { name: 'Potvrdit rezervaci' })
  ).not.toBeInTheDocument();
  await waitFor(() =>
    expect(screen.getByLabelText('Aktuální stav rezervace')).toHaveFocus()
  );
  expect(mutate).toHaveBeenCalledWith(
    expect.objectContaining({ change: { action: 'confirm' } })
  );
});
test('cancel uses safe dialog focus, validates reason, and renders server cancellation after success', async () => {
  setup();
  fireEvent.click(
    await screen.findByRole('button', { name: 'Zrušit rezervaci' })
  );
  const dialog = screen.getByRole('dialog', { name: 'Zrušit rezervaci' });
  expect(within(dialog).getByRole('button', { name: 'Zpět' })).toHaveFocus();
  fireEvent.click(
    within(dialog).getByRole('button', { name: 'Zrušit rezervaci' })
  );
  expect(screen.getByText('Zadejte důvod zrušení.')).toBeInTheDocument();
  expect(screen.getByLabelText('Důvod zrušení')).toHaveFocus();
  expect(mutate).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText('Důvod zrušení'), {
    target: { value: 'x'.repeat(501) },
  });
  fireEvent.click(
    within(dialog).getByRole('button', { name: 'Zrušit rezervaci' })
  );
  expect(
    screen.getByText('Důvod může mít maximálně 500 znaků.')
  ).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Důvod zrušení'), {
    target: { value: ' Zákaznice zrušila objednávku ' },
  });
  get.mockResolvedValueOnce({
    ...detail,
    status: 'cancelled',
    pendingExpired: false,
    cancellationReason: 'Zákaznice zrušila objednávku',
  });
  fireEvent.click(
    within(dialog).getByRole('button', { name: 'Zrušit rezervaci' })
  );
  await screen.findByText('Zrušená');
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(screen.getByText('Zákaznice zrušila objednávku')).toBeInTheDocument();
  expect(
    screen.queryByRole('button', { name: 'Zrušit rezervaci' })
  ).not.toBeInTheDocument();
});
test('notes limits prevent request, newer pending draft and textarea focus survive success, empty field clears', async () => {
  setup();
  const notes = await screen.findByLabelText('Poznámky');
  fireEvent.change(notes, { target: { value: 'x'.repeat(1501) } });
  fireEvent.click(screen.getByRole('button', { name: 'Uložit poznámky' }));
  expect(
    screen.getByText('Poznámky mohou mít maximálně 1500 znaků.')
  ).toBeInTheDocument();
  expect(mutate).not.toHaveBeenCalled();
  fireEvent.change(notes, { target: { value: 'submitted' } });
  const pending = deferred<typeof receipt>();
  mutate.mockReturnValueOnce(pending.promise);
  get.mockResolvedValueOnce({ ...detail, notes: 'submitted' });
  fireEvent.click(screen.getByRole('button', { name: 'Uložit poznámky' }));
  notes.focus();
  fireEvent.change(notes, { target: { value: 'newer text' } });
  await act(async () => pending.resolve(receipt));
  await screen.findByText('Poznámky byly uloženy.');
  expect(notes).toHaveValue('newer text');
  expect(notes).toHaveFocus();
  fireEvent.change(notes, { target: { value: '' } });
  get.mockResolvedValueOnce({ ...detail, notes: undefined });
  fireEvent.click(screen.getByRole('button', { name: 'Uložit poznámky' }));
  await waitFor(() =>
    expect(
      screen.getByRole('button', { name: 'Uložit poznámky' })
    ).toBeDisabled()
  );
  await waitFor(() =>
    expect(
      screen.queryByText('Zpracování změny rezervace…')
    ).not.toBeInTheDocument()
  );
  expect(mutate).toHaveBeenLastCalledWith(
    expect.objectContaining({ change: { action: 'notes', notes: '' } })
  );
});
test('unknown outcome visibly blocks lifecycle and notes until explicit GET recovers', async () => {
  setup();
  mutate.mockRejectedValueOnce(
    new AdminApiError({
      code: 'ADMIN_NETWORK_ERROR',
      kind: 'network',
      message: 'private',
    })
  );
  fireEvent.click(
    await screen.findByRole('button', { name: 'Potvrdit rezervaci' })
  );
  const alert = await screen.findByRole('alert');
  expect(alert).toHaveTextContent('Výsledek změny rezervace není potvrzený');
  await waitFor(() => expect(alert).toHaveFocus());
  expect(
    screen.getByRole('button', { name: 'Potvrdit rezervaci' })
  ).toBeDisabled();
  expect(
    screen.getByRole('button', { name: 'Zrušit rezervaci' })
  ).toBeDisabled();
  fireEvent.change(screen.getByLabelText('Poznámky'), {
    target: { value: 'draft' },
  });
  expect(
    screen.getByRole('button', { name: 'Uložit poznámky' })
  ).toBeDisabled();
  expect(get).toHaveBeenCalledTimes(1);
  get.mockResolvedValueOnce({ ...detail, status: 'confirmed' });
  fireEvent.click(screen.getByRole('button', { name: 'Načíst aktuální stav' }));
  await screen.findByRole('button', { name: 'Připravit rezervaci' });
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  expect(screen.getByLabelText('Poznámky')).toHaveValue('draft');
  expect(mutate).toHaveBeenCalledTimes(1);
});
test('route replacement removes cancel reason and dialog ownership', async () => {
  setup();
  fireEvent.click(
    await screen.findByRole('button', { name: 'Zrušit rezervaci' })
  );
  fireEvent.change(screen.getByLabelText('Důvod zrušení'), {
    target: { value: 'private previous reason' },
  });
  get.mockResolvedValueOnce({ ...detail, id: 'r2', reservationNumber: 'AK-2' });
  fireEvent.click(screen.getByRole('button', { name: 'Other reservation' }));
  await screen.findByRole('heading', { name: 'AK-2' });
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Zrušit rezervaci' }));
  expect(screen.getByLabelText('Důvod zrušení')).toHaveValue('');
});
