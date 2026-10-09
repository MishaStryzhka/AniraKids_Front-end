import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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
