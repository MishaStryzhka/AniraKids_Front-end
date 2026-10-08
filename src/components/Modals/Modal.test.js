import { fireEvent, render, screen } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import theme from '../theme';
import Modal from './Modal';

beforeEach(() => {
  const portal = document.createElement('div');
  portal.id = 'modal';
  document.body.appendChild(portal);
  document.body.style.overflowY = 'scroll';
});
afterEach(() => {
  document.getElementById('modal')?.remove();
  document.body.style.overflowY = '';
});
function View({ loggedIn = false, close = jest.fn(), tab = 'registration' }) {
  return (
    <ThemeProvider theme={theme.light}>
      {!loggedIn && (
        <Modal authModal prohibitClosingByBackdrop closeModal={close}>
          <label>
            E-mail
            <input defaultValue="fixture@example.test" />
          </label>
          <span>{tab}</span>
        </Modal>
      )}
    </ThemeProvider>
  );
}
test('login-driven unmount restores previous body scroll, rerenders and typing keep it locked', () => {
  const view = render(<View />);
  expect(document.body.style.overflowY).toBe('hidden');
  fireEvent.keyDown(screen.getByRole('textbox'), { key: 'a' });
  view.rerender(<View tab="login" />);
  expect(document.body.style.overflowY).toBe('hidden');
  view.rerender(<View loggedIn />);
  expect(document.body.style.overflowY).toBe('scroll');
});
test('backdrop does not dismiss or discard input; explicit close and Escape work', () => {
  const close = jest.fn();
  const view = render(<View close={close} />);
  fireEvent.change(screen.getByRole('textbox'), {
    target: { value: 'retained@example.test' },
  });
  fireEvent.click(document.querySelector('[data-auth-backdrop]'));
  expect(close).not.toHaveBeenCalled();
  expect(screen.getByRole('textbox')).toHaveValue('retained@example.test');
  fireEvent.click(screen.getByRole('button', { name: 'Zavřít' }));
  expect(close).toHaveBeenCalledTimes(1);
  fireEvent.keyDown(window, { key: 'Escape' });
  expect(close).toHaveBeenCalledTimes(2);
  view.unmount();
  expect(document.body.style.overflowY).toBe('scroll');
});
test('another mounted modal keeps the shared scroll lock until both unmount', () => {
  const first = render(<View />),
    second = render(<View />);
  first.unmount();
  expect(document.body.style.overflowY).toBe('hidden');
  second.unmount();
  expect(document.body.style.overflowY).toBe('scroll');
});
