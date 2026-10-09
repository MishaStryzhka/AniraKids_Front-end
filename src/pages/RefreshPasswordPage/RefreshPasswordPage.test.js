import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import { ModalAuthContext } from '../../context/ModalAuthContext';
import RefreshPasswordPage from './RefreshPasswordPage';
const mockDispatch = jest.fn();
jest.mock('react-redux', () => ({ useDispatch: () => mockDispatch }));
jest.mock('axios', () => ({ post: jest.fn(), defaults: { headers: { common: {} } } }));
jest.mock('../../redux/auth/slice', () => ({ clearSession: () => ({ type: 'clear-session' }) }));
function view(path = '/refreshPassword') { return render(<MemoryRouter initialEntries={[path]}><ModalAuthContext.Provider value={{ setIsOpenModalAuth: jest.fn() }}><RefreshPasswordPage /></ModalAuthContext.Provider></MemoryRouter>); }
test('recovery request provides a neutral response without disclosing account existence', async () => {
  axios.post.mockResolvedValue({ data: {} }); view();
  fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'fixture@seznam.cz' } });
  fireEvent.click(screen.getByRole('button', { name: 'Poslat odkaz' }));
  expect(await screen.findByRole('status')).toHaveTextContent('Pokud pro tuto adresu existuje účet');
  expect(axios.post).toHaveBeenCalledWith('/api/users/password/request-reset', { email: 'fixture@seznam.cz' });
});
test('password confirmation uses the one-time link and clears the previous session', async () => {
  axios.post.mockResolvedValue({ data: {} }); view('/refreshPassword?resetToken=test-only');
  fireEvent.change(screen.getByLabelText('Nové heslo'), { target: { value: 'FixturePassword123' } });
  fireEvent.change(screen.getByLabelText('Zopakujte nové heslo'), { target: { value: 'FixturePassword123' } });
  fireEvent.click(screen.getByRole('button', { name: 'Uložit nové heslo' }));
  expect(await screen.findByRole('status')).toHaveTextContent('Heslo bylo změněno');
  expect(mockDispatch).toHaveBeenCalledWith({ type: 'clear-session' });
});
test('expired links show recovery rather than false success', async () => {
  axios.post.mockRejectedValue(new Error('expired')); view('/refreshPassword?resetToken=expired');
  fireEvent.change(screen.getByLabelText('Nové heslo'), { target: { value: 'FixturePassword123' } });
  fireEvent.change(screen.getByLabelText('Zopakujte nové heslo'), { target: { value: 'FixturePassword123' } });
  fireEvent.click(screen.getByRole('button', { name: 'Uložit nové heslo' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('vypršel');
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
});
