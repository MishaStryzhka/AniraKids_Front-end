import {act, fireEvent, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {Dialog} from './Dialog';

function frames() {
  const callbacks: FrameRequestCallback[] = [];
  jest.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => {callbacks.push(callback); return callbacks.length;});
  jest.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
  return () => act(() => {callbacks.splice(0).forEach(callback => callback(0));});
}
afterEach(() => jest.restoreAllMocks());

test('dialog is modal, focuses first action and Escape calls callback', () => {
  const escape = jest.fn();
  render(<><div id="root"/><Dialog open title="Neuložené změny" description="Text" onEscape={escape}><button>Zůstat</button><button>Odejít</button></Dialog></>);
  expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
  expect(screen.getByRole('button', {name: 'Zůstat'})).toHaveFocus();
  fireEvent.keyDown(document, {key: 'Escape'});
  expect(escape).toHaveBeenCalled();
});

test('deferred close restores global state before resolving a programmatic heading target', () => {
  const flush = frames();
  const root = document.createElement('div');
  root.id = 'root';
  root.setAttribute('aria-hidden', 'false');
  document.body.appendChild(root);
  const heading = document.createElement('h2');
  heading.tabIndex = -1;
  heading.textContent = 'Fotografie';
  root.appendChild(heading);
  document.body.style.overflow = 'scroll';
  document.documentElement.style.overflow = 'auto';
  const resolve = jest.fn(() => {
    expect(root).not.toHaveAttribute('inert');
    expect(root).toHaveAttribute('aria-hidden', 'false');
    expect(document.body.style.overflow).toBe('scroll');
    expect(document.documentElement.style.overflow).toBe('auto');
    return heading;
  });
  const view = render(<Dialog open title="Delete" onEscape={() => undefined} resolveRestoreFocus={resolve}><button>Zrušit</button></Dialog>);
  view.rerender(<Dialog open={false} title="Delete" onEscape={() => undefined} resolveRestoreFocus={resolve}><button>Zrušit</button></Dialog>);
  flush();
  expect(heading).toHaveFocus();
  expect(resolve).toHaveBeenCalledTimes(1);
  view.unmount();
  root.remove();
  document.body.style.overflow = '';
  document.documentElement.style.overflow = '';
});

test('old deferred cleanup never steals focus behind a replacement modal', () => {
  const flush = frames();
  const trigger = document.createElement('button');
  trigger.textContent = 'Trigger';
  document.body.appendChild(trigger);
  userEvent.click(trigger);
  const view = render(<Dialog open title="Delete" onEscape={() => undefined}><button>Zrušit</button></Dialog>);
  view.rerender(<Dialog open={false} title="Delete" onEscape={() => undefined}><button>Zrušit</button></Dialog>);
  view.rerender(<Dialog open title="Leave" onEscape={() => undefined}><button>Zůstat</button></Dialog>);
  expect(screen.getByRole('button', {name: 'Zůstat'})).toHaveFocus();
  flush();
  expect(screen.getByRole('button', {name: 'Zůstat'})).toHaveFocus();
  view.unmount();
  trigger.remove();
});

test('unmount cancels deferred restoration even if the old external trigger remains connected', () => {
  const flush = frames();
  const trigger = document.createElement('button');
  document.body.appendChild(trigger);
  userEvent.click(trigger);
  const resolve = jest.fn(() => trigger);
  const view = render(<Dialog open title="Delete" onEscape={() => undefined} resolveRestoreFocus={resolve}><button>Zrušit</button></Dialog>);
  view.rerender(<Dialog open={false} title="Delete" onEscape={() => undefined} resolveRestoreFocus={resolve}><button>Zrušit</button></Dialog>);
  view.unmount();
  resolve.mockClear();
  flush();
  expect(trigger).not.toHaveFocus();
  expect(resolve).not.toHaveBeenCalled();
  trigger.remove();
});
