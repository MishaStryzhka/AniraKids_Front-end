import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ConfirmEmailPage from './ConfirmEmailPage';
const mockDispatch = jest.fn();
jest.mock('react-redux', () => ({ useDispatch: () => mockDispatch }));
jest.mock('../../redux/auth/operations', () => ({ confirmUserEmail: value => ({ type: 'confirm', payload: value }) }));
const mount = path => render(<MemoryRouter initialEntries={[path]}><ConfirmEmailPage /></MemoryRouter>);
beforeEach(() => mockDispatch.mockReset());
test('missing token displays recovery without sending a request', () => {
  mount('/confirmEmail');
  expect(screen.getByRole('alert')).toHaveTextContent('chybí');
  expect(mockDispatch).not.toHaveBeenCalled();
});
test('success is shown only after server confirmation, with one request', async () => {
  mockDispatch.mockResolvedValue({ meta: { requestStatus: 'fulfilled' } });
  mount('/confirmEmail?token=test-only');
  expect(await screen.findByText('Vaše e-mailová adresa byla úspěšně potvrzena.')).toBeInTheDocument();
  expect(mockDispatch).toHaveBeenCalledTimes(1);
  expect(screen.getByRole('link', { name: 'Přejít do účtu' })).toHaveAttribute('href', '/ucet');
});
test('rejected or expired links display recovery, not success', async () => {
  mockDispatch.mockResolvedValue({ meta: { requestStatus: 'rejected' } });
  mount('/confirmEmail?token=test-only');
  expect(await screen.findByRole('alert')).toHaveTextContent('nepodařilo');
});
