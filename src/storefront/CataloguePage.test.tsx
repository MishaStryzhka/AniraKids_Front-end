import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { CataloguePage } from './CataloguePage';
import { getCatalogue } from './api/publicApi';
jest.mock('./api/publicApi', () => ({ ...jest.requireActual('./api/publicApi'), getCatalogue: jest.fn() }));
const get = getCatalogue as jest.Mock;
function Location() { const location = useLocation(); return <output data-testid="url">{location.pathname + location.search}</output>; }
function show(url: string) { return render(<MemoryRouter initialEntries={[url]}><CataloguePage /><Location /></MemoryRouter>); }
beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', { writable: true, value: jest.fn().mockImplementation(() => ({ matches: true, addEventListener: jest.fn(), removeEventListener: jest.fn() })) });
    get.mockReset().mockImplementation(async (query) => ({ items: [], ...query, total: 0, totalPages: 0, facets: { colors: ['Bílá'], sizes: ['110'] } }));
});
test('filters are sent together, reset pagination and survive in URL', async () => {
    show('/saty?page=3');
    await screen.findByText('Pro zvolené filtry jsme nenašli žádné produkty.');
    fireEvent.click(screen.getByRole('button', { name: 'Filtrovat' }));
    fireEvent.change(screen.getByLabelText('Barva'), { target: { value: 'Bílá' } });
    fireEvent.change(screen.getByLabelText('Velikost'), { target: { value: '110' } });
    fireEvent.change(screen.getByLabelText('Cena do (Kč)'), { target: { value: '500' } });
    fireEvent.click(screen.getByRole('button', { name: 'Použít filtry' }));
    await waitFor(() => expect(get).toHaveBeenLastCalledWith(expect.objectContaining({ category: 'dress', color: 'Bílá', size: '110', maxPrice: 500, page: 1 }), expect.any(AbortSignal)));
    expect(screen.getByTestId('url')).not.toHaveTextContent('page=');
    fireEvent.change(screen.getByLabelText('SEŘADIT PODLE'), { target: { value: 'priceDesc' } });
    await waitFor(() => expect(get).toHaveBeenLastCalledWith(expect.objectContaining({ sort: 'priceDesc', color: 'Bílá' }), expect.any(AbortSignal)));
});
test.each([['/forWomen', 'women'], ['/forMen', 'men'], ['/forChildren', 'children']])('legacy %s uses the same API and preserves audience', async (url, gender) => {
    show(url);
    await waitFor(() => expect(get).toHaveBeenCalledWith(expect.objectContaining({ gender }), expect.any(AbortSignal)));
    expect(screen.getByRole('navigation', { name: 'Drobečková navigace' })).toBeInTheDocument();
});
test('inverted prices are rejected before a request', async () => {
    show('/pronajem');
    await screen.findByText('Pro zvolené filtry jsme nenašli žádné produkty.');
    const count = get.mock.calls.length;
    fireEvent.click(screen.getByRole('button', { name: 'Filtrovat' }));
    fireEvent.change(screen.getByLabelText('Cena od (Kč)'), { target: { value: '800' } });
    fireEvent.change(screen.getByLabelText('Cena do (Kč)'), { target: { value: '200' } });
    fireEvent.click(screen.getByRole('button', { name: 'Použít filtry' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Cena od nesmí');
    expect(get).toHaveBeenCalledTimes(count);
});
test('URL filters initialize controls and reset clears them', async () => {
    show('/saty?color=B%C3%ADl%C3%A1&size=110&sort=priceAsc');
    await screen.findByText('Pro zvolené filtry jsme nenašli žádné produkty.');
    expect(screen.getByLabelText('Barva')).toHaveValue('Bílá');
    fireEvent.click(screen.getAllByRole('button', { name: 'Zrušit filtry' })[0]);
    await waitFor(() => expect(screen.getByTestId('url')).toHaveTextContent(/^\/saty$/));
});

function card(id: string) { return { id, slug: id, name: id, photos: [], rentalPriceFrom: 100 }; }
function batch(page: number, ids: string[], total = 24) { return { items: ids.map(card), page, limit: 12, total, totalPages: Math.ceil(total / 12) }; }
let intersection: IntersectionObserverCallback;
const disconnect = jest.fn();
beforeEach(() => {
  window.IntersectionObserver = jest.fn(callback => {
    intersection = callback;
    return { observe: jest.fn(), disconnect, unobserve: jest.fn() };
  }) as unknown as typeof IntersectionObserver;
});
function reachBottom() { intersection([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver); }
test('scroll appends products once, preserves existing cards, and stops at end', async () => {
  get.mockResolvedValueOnce(batch(1, ['first'])).mockResolvedValueOnce(batch(2, ['first', 'second']));
  show('/pronajem?page=3');
  await screen.findByRole('heading', { name: 'first' });
  expect(get.mock.calls[0][0].page).toBe(1);
  expect(screen.getByTestId('url')).not.toHaveTextContent('page=');
  const first = screen.getByRole('heading', { name: 'first' });
  await waitFor(() => expect(window.IntersectionObserver).toHaveBeenCalled());
  act(() => { reachBottom(); reachBottom(); });
  await screen.findByRole('heading', { name: 'second' });
  expect(screen.getByRole('heading', { name: 'first' })).toBe(first);
  expect(screen.getAllByRole('heading', { name: 'first' })).toHaveLength(1);
  expect(get).toHaveBeenCalledTimes(2);
  expect(screen.queryByRole('button', { name: 'Načíst další' })).not.toBeInTheDocument();
  expect(screen.queryByLabelText('Stránkování')).not.toBeInTheDocument();
});
test('later-page failure keeps cards and retries the same page only on request', async () => {
  get.mockResolvedValueOnce(batch(1, ['first'])).mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(batch(2, ['second']));
  show('/pronajem'); await screen.findByRole('heading', { name: 'first' });
  await waitFor(() => expect(window.IntersectionObserver).toHaveBeenCalled());
  act(reachBottom);
  await screen.findByRole('alert');
  expect(screen.getByRole('heading', { name: 'first' })).toBeInTheDocument();
  expect(get).toHaveBeenCalledTimes(2);
  fireEvent.click(screen.getByRole('button', { name: 'Zkusit znovu' }));
  await screen.findByRole('heading', { name: 'second' });
  expect(get.mock.calls.map(call => call[0].page)).toEqual([1, 2, 2]);
});
test('sorting cancels an in-flight page and ignores its stale response', async () => {
  let finish!: (value: unknown) => void;
  get.mockResolvedValueOnce(batch(1, ['old'])).mockImplementationOnce(() => new Promise(resolve => { finish = resolve; })).mockResolvedValueOnce(batch(1, ['sorted'], 1));
  show('/pronajem'); await screen.findByRole('heading', { name: 'old' });
  await waitFor(() => expect(window.IntersectionObserver).toHaveBeenCalled());
  act(reachBottom);
  fireEvent.change(screen.getByLabelText('SEŘADIT PODLE'), { target: { value: 'priceDesc' } });
  await screen.findByRole('heading', { name: 'sorted' });
  expect(get.mock.calls[1][1].aborted).toBe(true);
  await act(async () => finish(batch(2, ['stale'])));
  expect(screen.queryByRole('heading', { name: 'old' })).not.toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: 'stale' })).not.toBeInTheDocument();
});
test('load-more remains usable without IntersectionObserver', async () => {
  window.IntersectionObserver = undefined as unknown as typeof IntersectionObserver;
  get.mockResolvedValueOnce(batch(1, ['first'])).mockResolvedValueOnce(batch(2, ['second']));
  show('/pronajem'); await screen.findByRole('heading', { name: 'first' });
  fireEvent.click(screen.getByRole('button', { name: 'Načíst další' }));
  await screen.findByRole('heading', { name: 'second' });
});

test('girls dresses keeps its audience through URL overrides, filters and reset', async () => {
    show('/saty?gender=women&color=B%C3%ADl%C3%A1');
    await screen.findByText('Pro zvolené filtry jsme nenašli žádné produkty.');
    expect(screen.getByRole('heading', {name:'Dívčí šaty', level:1})).toBeInTheDocument();
    expect(screen.queryByLabelText('Pro koho')).not.toBeInTheDocument();
    expect(get.mock.calls.every(([q]) => q.category === 'dress' && q.gender === 'girls')).toBe(true);
    await waitFor(() => expect(screen.getByTestId('url')).not.toHaveTextContent('gender='));
    fireEvent.click(screen.getByRole('button', {name:'Filtrovat'}));
    fireEvent.click(screen.getByRole('button', {name:'Použít filtry'}));
    fireEvent.click(screen.getAllByRole('button', {name:'Zrušit filtry'})[0]);
    await waitFor(() => expect(get).toHaveBeenLastCalledWith(expect.objectContaining({category:'dress',gender:'girls'}), expect.any(AbortSignal)));
});
test('women dresses link keeps both product type and audience', async () => {
    show('/forWomen?category=dress');
    expect(screen.getByRole('heading', {name:'Dámské šaty',level:1})).toBeInTheDocument();
    await waitFor(() => expect(get).toHaveBeenCalledWith(expect.objectContaining({category:'dress',gender:'women'}), expect.any(AbortSignal)));
});
