import { bookingPolicyFixture } from './bookingFixtures';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  act,
} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { BookingPage } from './BookingPage';
import { BookingProvider, useBooking } from './BookingProvider';
import {
  getAvailability,
  getRentalCalendar,
  getBookingPolicy,
  postReservation,
  PublicApiError,
} from '../api/publicApi';
import { product, quote, body, receipt, deferred } from './bookingFixtures';
import { SESSION_KEY } from './bookingModel';
jest.mock('../api/publicApi', () => ({
  ...jest.requireActual('../api/publicApi'),
  getAvailability: jest.fn(),
  getRentalCalendar: jest.fn(),
  getBookingPolicy: jest.fn(),
  postReservation: jest.fn(),
}));
const get = getAvailability as jest.MockedFunction<typeof getAvailability>,
  post = postReservation as jest.MockedFunction<typeof postReservation>;
function Entry() {
  const b = useBooking();
  return (
    <>
      <button onClick={() => b.chooseProduct(product)}>Choose product</button>
      <BookingPage />
    </>
  );
}
function setup() {
  render(
    <MemoryRouter>
      <BookingProvider>
        <Entry />
      </BookingProvider>
    </MemoryRouter>
  );
  fireEvent.click(screen.getByRole('button', { name: 'Choose product' }));
}
beforeEach(() => {
  jest.spyOn(window, 'scrollTo').mockImplementation(() => {});
  (getBookingPolicy as jest.Mock).mockResolvedValue(bookingPolicyFixture);
  (getRentalCalendar as jest.Mock).mockImplementation(async query => ({
    ...query, today: '2026-01-01', checkedAt: '2026-01-01T12:00:00Z',
    days: require('../../admin/calendar/calendarDates').monthCalendarDays(query.month)
      .map((date: string) => ({date, available: !query.startDate || date >= query.startDate})),
  }));
  sessionStorage.clear();
  get.mockReset();
  post.mockReset();
  get.mockResolvedValue(quote);
  post.mockResolvedValue(receipt);
  Object.defineProperty(globalThis, 'crypto', {
    value: require('crypto').webcrypto,
    configurable: true,
  });
});
function selection() {
  fireEvent.change(screen.getByLabelText('Velikost'), {
    target: { value: product.variants[0].id },
  });
  fireEvent.change(screen.getByLabelText('Od'), {
    target: { value: body.startDate },
  });
  fireEvent.change(screen.getByLabelText('Do'), {
    target: { value: body.endDate },
  });
}
test('selection and contact field errors focus; observed available summary enables submit', async () => {
  setup();
  fireEvent.click(screen.getByRole('button', { name: 'Ověřit dostupnost' }));
  expect(screen.getByLabelText('Velikost')).toHaveFocus();
  expect(get).not.toHaveBeenCalled();
  selection();
  fireEvent.click(screen.getByRole('button', { name: 'Ověřit dostupnost' }));
  await screen.findByText('Termín je aktuálně dostupný');
  fireEvent.click(
    screen.getByRole('button', { name: 'Rezervovat', exact: true })
  );
  expect(screen.getByLabelText('Jméno')).toHaveFocus();
  expect(post).not.toHaveBeenCalled();
  for (const [label, value] of Object.entries({
    Jméno: body.customer.firstName,
    Příjmení: body.customer.lastName,
    'E-mail': body.customer.email,
    Telefon: body.customer.phone,
  }))
    fireEvent.change(screen.getByLabelText(label), { target: { value } });
  fireEvent.click(
    screen.getByRole('button', { name: 'Rezervovat', exact: true })
  );
  await screen.findByText('Rezervace byla vytvořena');
  await waitFor(() =>
    expect(
      screen.getByRole('heading', { name: 'Rezervace byla vytvořena' })
    ).toHaveFocus()
  );
  expect(sessionStorage.getItem(SESSION_KEY)).not.toContain(
    body.customer.email
  );
});
test('changing selection hides quote synchronously and old in-flight response cannot enable submit', async () => {
  const pending = deferred<typeof quote>();
  get.mockReturnValue(pending.promise);
  setup();
  selection();
  fireEvent.click(screen.getByRole('button', { name: 'Ověřit dostupnost' }));
  fireEvent.change(screen.getByLabelText('Do'), {
    target: { value: '2030-10-12' },
  });
  await act(async () => pending.resolve(quote));
  expect(
    screen.queryByText('Termín je aktuálně dostupný')
  ).not.toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: 'Rezervovat', exact: true })
  ).toBeDisabled();
  expect(post).not.toHaveBeenCalled();
});

test('known rejection can recheck the same selection without changing contact', async () => {
  setup();
  selection();
  fireEvent.click(screen.getByRole('button', { name: 'Ověřit dostupnost' }));
  await screen.findByText('Termín je aktuálně dostupný');
  for (const [label, value] of Object.entries({
    Jméno: body.customer.firstName,
    Příjmení: body.customer.lastName,
    'E-mail': body.customer.email,
    Telefon: body.customer.phone,
  }))
    fireEvent.change(screen.getByLabelText(label), { target: { value } });
  post.mockRejectedValueOnce(new PublicApiError('NO_AVAILABLE_INVENTORY', 409));
  fireEvent.click(
    screen.getByRole('button', { name: 'Rezervovat', exact: true })
  );
  await screen.findByText(
    'Tento termín není dostupný. Vyberte prosím jiný termín.'
  );
  expect(
    screen.getByRole('button', { name: 'Rezervovat', exact: true })
  ).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Ověřit dostupnost' }));
  await screen.findByText('Termín je aktuálně dostupný');
  expect(get).toHaveBeenCalledTimes(2);
  expect(screen.getByLabelText('E-mail')).toHaveValue(body.customer.email);
  expect(post).toHaveBeenCalledTimes(1);
});
