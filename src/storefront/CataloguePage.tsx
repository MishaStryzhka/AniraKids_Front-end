import { FavoriteButton, FavoritesFeedback } from './favorites/FavoriteButton';
import IconBeauty from '../images/icons/IconBeauty';
import { NavigationLink } from '../design-system/components/NavigationLink';
import { Breadcrumbs } from '../design-system/components/Breadcrumbs';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { Button } from '../design-system/components/Button';
import { Input } from '../design-system/components/Input';
import { designTokens as t } from '../design-system/tokens/designTokens';
import { PublicApiError, type CatalogueQuery, type ProductCard, } from './api/publicApi';
import { useInfiniteCatalogue } from './useInfiniteCatalogue';
import { Actions, Alert, Copy, Heading, Page, RouteLink, Stack, Title, } from './storefrontStyles';
import { productPath, routes } from '../navigation/routes';
export const Grid = styled.ul `
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: ${t.space[6]};
  grid-template-columns: repeat(2, minmax(0, 1fr));
  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  @media (max-width: 479px) {
    grid-template-columns: minmax(0, 1fr);
  }
  > li {
    min-inline-size: 0;
    display: grid;
    gap: ${t.space[3]};
    align-content: start;
  }
`;
const Cover = styled.div `
  aspect-ratio: 3/4;
  display: grid;
  place-items: center;
  background: ${t.color.bg.subtle};
  border-radius: ${t.radius[2]};
  overflow: hidden;
  color: ${t.color.text.muted};
  img {
    inline-size: 100%;
    block-size: 100%;
    object-fit: cover;
  }
`;
export function ProductImage({ product }: {
    product: ProductCard;
}) {
    const [failed, setFailed] = useState(false);
    const url = product.photos[0]?.url;
    useEffect(() => setFailed(false), [url]);
    return (<Cover>
      {url && !failed ? (<img src={url} alt={product.photos[0].alt || product.name} loading="lazy" onError={() => setFailed(true)}/>) : (<Copy>Fotografie není k dispozici.</Copy>)}
    </Cover>);
}
const CataloguePageLayout = styled(Page)`
  padding-block-start: ${t.space[4]};
  gap: ${t.space[4]};
`;
const CatalogueHeader = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: ${t.space[2]} ${t.space[6]};
  padding-block-end: ${t.space[4]};
  border-bottom: 1px solid ${t.color.border.subtle};
`;
const CatalogueTitle = styled(Title)`
  font-family: ${t.font.family.editorial};
  font-size: ${t.type.h1.mobile.size};
  line-height: ${t.type.h1.mobile.lineHeight};
  font-weight: ${t.font.weight.medium};
  letter-spacing: ${t.type.h1.letterSpacing};
  @media (min-width: ${t.breakpoint.md}) {
    font-size: ${t.type.h1.md.size};
    line-height: ${t.type.h1.md.lineHeight};
  }
`;
const DressNavigation = styled.nav`
  display: flex;
  flex-wrap: wrap;
  gap: ${t.space[2]};
`;
const Layout = styled.div `
  display: grid;
  gap: 32px;
  min-width: 0;
  @media (min-width: 768px) { grid-template-columns: 220px minmax(0, 1fr); }
`;
const FilterToggle = styled(Button) `@media (min-width: 768px) { display: none; }`;
const Filters = styled.form<{
    $open: boolean;
}> `
  display: ${({ $open }) => $open ? 'grid' : 'none'};
  gap: 16px;
  align-content: start;
  min-width: 0;
  @media (min-width: 768px) { display: grid; }
  h2 { margin: 0; font-size: 18px; letter-spacing: 0.06em; font-weight: 500; }
  details { border-bottom: 1px solid ${t.color.border.subtle}; padding-bottom: 12px; }
  summary { cursor: pointer; min-height: 44px; display: flex; align-items: center; justify-content: space-between; }
  summary::after { content: '+'; }
  details[open] > summary::after { content: '−'; }
  label { display: grid; gap: 8px; font-size: 14px; margin-block: 8px; }
  input[type=checkbox] { width: 20px; height: 20px; accent-color: ${t.color.text.brand}; }
`;
const Select = styled.select `
  width: 100%; min-width: 0; min-height: 44px; padding: 8px;
  background: ${t.color.bg.canvas}; color: ${t.color.text.primary};
  border: 1px solid ${t.color.border.default}; border-radius: 4px; font: inherit;
`;
const Toolbar = styled.div `
  display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap;
  gap: 16px; margin-bottom: 16px;
  label { display: flex; align-items: center; flex-wrap: wrap; gap: 12px; font-size: 13px; }
  select { width: auto; max-width: 100%; }
`;
const Empty = styled.div `
  min-height: 300px; display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 20px; text-align: center;
`;
const filterKeys = ['category', 'gender', 'familyLook', 'color', 'size', 'rentalMode', 'minPrice', 'maxPrice'] as const;
const categories = [['dress', 'Šaty'], ['suit', 'Obleky'], ['set', 'Soupravy'], ['accessory', 'Doplňky'], ['other', 'Ostatní']];
const genders = [['girls', 'Dívky'], ['boys', 'Chlapci'], ['women', 'Ženy'], ['men', 'Muži'], ['unisex', 'Unisex'], ['children', 'Děti']];
const sorts = [['name', 'Podle názvu'], ['newest', 'Nejnovější'], ['priceAsc', 'Cena od nejnižší'], ['priceDesc', 'Cena od nejvyšší']];
export function CataloguePage() {
    const { pathname, search } = useLocation();
    const [params, setParams] = useSearchParams();
    const isSearch = pathname === routes.search;
    const root = '/' + pathname.split('/')[1];
    const legacy = root === '/forWomen' ? { title: 'Dámské oblečení', gender: 'women' } :
        root === '/forMen' ? { title: 'Pánské oblečení', gender: 'men' } :
            root === '/forChildren' ? { title: 'Dětské oblečení', gender: 'children' } : null;
    const fixedCategory = pathname === routes.dresses ? 'dress' : pathname === routes.suits ? 'suit' : root === '/decorAndToys' ? 'accessory' : '';
    const fixedGender = pathname === routes.dresses ? 'girls' : legacy?.gender;
    const isWomenDresses = root === '/forWomen' && params.get('category') === 'dress';
    const title = (isWomenDresses ? 'Dámské šaty' : legacy?.title) || (fixedCategory === 'dress' ? 'Dívčí šaty' : fixedCategory === 'suit' ? 'Obleky' : fixedCategory === 'accessory' ? 'Doplňky' : root === '/popular' || pathname === routes.newArrivals ? 'Novinky' : isSearch ? 'Hledání' : 'Pronájem');
    const q = (params.get('q') || '').trim();
    useEffect(() => {
      if (params.has('page') || (pathname === routes.dresses && params.has('gender'))) {
        const next = new URLSearchParams(params);
        next.delete('page');
        if (pathname === routes.dresses) next.delete('gender');
        setParams(next, { replace: true });
      }
    }, [params, setParams, pathname]);
    const sort = params.get('sort') || (title === 'Novinky' ? 'newest' : 'name');
    const serialized = params.toString();
    const readFilters = () => Object.fromEntries(filterKeys.map(key => [key, params.get(key) || (key === 'rentalMode' ? 'studio' : '')]));
    const [draft, setDraft] = useState(readFilters);
    const [query, setQuery] = useState(q);
    const [open, setOpen] = useState(false);
    const [formError, setFormError] = useState('');
    useEffect(() => { setDraft(Object.fromEntries(filterKeys.map(key => [key, new URLSearchParams(serialized).get(key) || (key === 'rentalMode' ? 'studio' : '')]))); setFormError(''); }, [serialized, pathname]);
    useEffect(() => setQuery(q), [q]);
    const request: CatalogueQuery = { sort: sort as CatalogueQuery['sort'], page: 1, limit: 12 };
    for (const key of filterKeys) {
        const value = params.get(key);
        if (value)
            Object.assign(request, { [key]: key === 'minPrice' || key === 'maxPrice' ? Number(value) : value });
    }
    if (fixedCategory)
        request.category = fixedCategory;
    if (fixedGender)
        request.gender = fixedGender as CatalogueQuery['gender'];
    if (q)
        request.q = q;
    const priceError = (values: Record<string, string>) => {
        if (['minPrice', 'maxPrice'].some(key => values[key] && !/^(0|[1-9]\d{0,6})$/.test(values[key])))
            return 'Zadejte cenu v celých korunách (0–9 999 999 Kč).';
        if (values.minPrice && values.maxPrice && Number(values.minPrice) > Number(values.maxPrice))
            return 'Cena od nesmí být vyšší než cena do.';
        return '';
    };
    const invalid = q.length > 100 ? 'Hledaný výraz může mít maximálně 100 znaků.' : priceError(readFilters()) ||
        (!sorts.some(([value]) => value === sort) || (request.category && !categories.some(([value]) => value === request.category)) ||
            (request.gender && !genders.some(([value]) => value === request.gender)) ||
            (request.rentalMode && !['studio', 'external'].includes(request.rentalMode)) ||
            (request.familyLook && request.familyLook !== 'true') || (request.color?.length || 0) > 80 || (request.size?.length || 0) > 80 ? 'Neplatné filtry. Obnovte prosím výchozí nastavení.' : '');
    const result = useInfiniteCatalogue(invalid ? null : JSON.stringify(request));
    const sentinel = useRef<HTMLDivElement>(null);
    const { hasMore, loadingMore, error, loadMore } = result;
    useEffect(() => {
      if (!hasMore || loadingMore || error || !sentinel.current || typeof IntersectionObserver === 'undefined') return;
      const observer = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) loadMore();
      }, { rootMargin: '400px 0px' });
      observer.observe(sentinel.current);
      return () => observer.disconnect();
    }, [hasMore, loadingMore, error, loadMore, result.data?.page]);
    const heading = useRef<HTMLHeadingElement>(null);
    const update = (key: string, value: string) => setDraft(previous => ({ ...previous, [key]: value }));
    const reset = () => { const next = new URLSearchParams(); if (q)
        next.set('q', q); setParams(next); setDraft(Object.fromEntries(filterKeys.map(key => [key, key === 'rentalMode' ? 'studio' : '']))); setFormError(''); };
    const options = (values: string[], selected: string) => Array.from(new Set([...values, ...(selected ? [selected] : [])])).map(value => <option key={value} value={value}>{value}</option>);
    return <CataloguePageLayout>
    <Breadcrumbs items={[{ label: 'Domů', to: routes.home }, { label: title }]}/>
    <CatalogueHeader>
      <CatalogueTitle ref={heading} tabIndex={-1}>{title}</CatalogueTitle>
      {(pathname === routes.dresses || isWomenDresses) && <DressNavigation aria-label="Kategorie šatů">
        <NavigationLink variant="navigation" to={routes.dresses} aria-current={pathname === routes.dresses ? 'page' : undefined}>Dívčí šaty</NavigationLink>
        <NavigationLink variant="navigation" to="/forWomen?category=dress" aria-current={isWomenDresses ? 'page' : undefined}>Dámské šaty</NavigationLink>
      </DressNavigation>}
    </CatalogueHeader>
    {pathname === routes.rental && <Copy id="jak-funguje-pronajem">Vyberte produkt, velikost a termín. Po ověření dostupnosti vyplňte kontaktní údaje a odešlete rezervaci.</Copy>}
    {pathname.split('/').filter(Boolean).length > 1 && <Copy>Původní odkaz na produkt již není aktuální. Vyberte prosím z aktuální nabídky.</Copy>}
    {isSearch && <form onSubmit={event => { event.preventDefault(); setParams(query.trim() ? { q: query.trim() } : {}); }}><Stack><Input label="Hledat produkt" value={query} onChange={event => setQuery(event.target.value)}/><Actions><Button type="submit">Hledat</Button></Actions></Stack></form>}
    <FilterToggle variant="secondary" aria-expanded={open} aria-controls="catalogue-filters" onClick={() => setOpen(!open)}>Filtrovat</FilterToggle>
    <FavoritesFeedback />
    <Layout>
      <Filters id="catalogue-filters" $open={open} aria-label="Filtry produktů" onSubmit={event => {
            event.preventDefault();
            const error = priceError(draft);
            setFormError(error);
            if (error)
                return;
            const next = new URLSearchParams(params);
            next.delete('page');
            filterKeys.forEach(key => { const value = key === 'gender' && fixedGender ? '' : draft[key]; value ? next.set(key, value) : next.delete(key); });
            setParams(next);
        }}>
        <h2>FILTROVAT</h2>
        {(!fixedCategory || !fixedGender) && <details><summary>TYP</summary>
          {!fixedCategory && <label>Kategorie<Select value={draft.category} onChange={event => update('category', event.target.value)}><option value="">Všechny</option>{categories.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select></label>}
          {!fixedGender && <label>Pro koho<Select value={draft.gender} onChange={event => update('gender', event.target.value)}><option value="">Všichni</option>{genders.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select></label>}
        </details>}
        <details><summary>FAMILY LOOK</summary><label><span><input type="checkbox" checked={draft.familyLook === 'true'} onChange={event => update('familyLook', event.target.checked ? 'true' : '')}/> Sladěné rodinné modely</span></label></details>
        <details><summary>CENA</summary>
          <label>Způsob pronájmu<Select value={draft.rentalMode} onChange={event => update('rentalMode', event.target.value)}><option value="studio">Ve studiu</option><option value="external">Mimo studio</option></Select></label>
          <Input label="Cena od (Kč)" type="number" min="0" max="9999999" step="1" value={draft.minPrice} onChange={event => update('minPrice', event.target.value)}/>
          <Input label="Cena do (Kč)" type="number" min="0" max="9999999" step="1" value={draft.maxPrice} onChange={event => update('maxPrice', event.target.value)}/>
          <Copy>Cena pronájmu bez vratné kauce.</Copy>
        </details>
        <details><summary>BARVA</summary><label>Barva<Select value={draft.color} onChange={event => update('color', event.target.value)}><option value="">Všechny barvy</option>{options(result.data?.facets?.colors || [], draft.color)}</Select></label></details>
        <details><summary>VELIKOST</summary><label>Velikost<Select value={draft.size} onChange={event => update('size', event.target.value)}><option value="">Všechny velikosti</option>{options(result.data?.facets?.sizes || [], draft.size)}</Select></label></details>
        {formError && <Alert role="alert">{formError}</Alert>}
        <Button type="submit">Použít filtry</Button><Button type="button" variant="secondary" onClick={reset}>Zrušit filtry</Button>
      </Filters>
      <div style={{ minWidth: 0 }}>
        <Toolbar><Copy aria-live="polite">{result.loading ? 'Načítání…' : result.data ? `Počet modelů: ${result.data.total}` : ''}</Copy><label>SEŘADIT PODLE<Select value={sort} onChange={event => { const next = new URLSearchParams(params); next.set('sort', event.target.value); next.delete('page'); setParams(next); }}>{sorts.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select></label></Toolbar>
        {invalid ? <Alert role="alert">{invalid}<Button variant="secondary" onClick={reset}>Zrušit filtry</Button></Alert> : result.loading ? <Copy role="status">Načítání produktů…</Copy> : result.error && !result.data ? <Alert role="alert"><Heading>Produkty se nepodařilo načíst</Heading><Copy>{result.error instanceof PublicApiError && result.error.code === 'NOT_CONFIGURED' ? 'Katalog nyní není dostupný.' : 'Zkuste to prosím znovu.'}</Copy><Button onClick={result.reload}>Zkusit znovu</Button></Alert> : result.data?.items.length ? <Grid>{result.data.items.map(product => <li key={product.id}>
          <div style={{ position: 'relative' }}><span style={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}><FavoriteButton id={product.id} name={product.name} /></span><RouteLink to={productPath(product.slug)}
                  state={{ catalogueReturnTo: pathname + search }} aria-label={`Prohlédnout ${product.name}`} style={{ display: 'block', padding: 0 }}><ProductImage product={product}/></RouteLink></div><Heading>{product.name}</Heading>
          {product.color && <Copy>{product.color}</Copy>}
          {product.rentalPriceFrom !== undefined && <Copy>Od {product.rentalPriceFrom.toLocaleString('cs-CZ')} Kč · {request.rentalMode === 'external' ? 'mimo studio' : 've studiu'}</Copy>}
        </li>)}</Grid> : result.data ? <Empty><IconBeauty className="catalogue-empty-illustration" aria-hidden="true"/><Copy>Pro zvolené filtry jsme nenašli žádné produkty.</Copy><Button variant="secondary" onClick={reset}>Zrušit filtry</Button></Empty> : null}
        {result.data && result.data.items.length > 0 && <div ref={sentinel} style={{ paddingBlock: 24 }}>
          <Copy role="status">{loadingMore ? 'Načítání dalších produktů…' : `Zobrazeno ${result.data.items.length} z ${result.data.total} modelů`}</Copy>
          {result.error ? <Alert role="alert"><Copy>Další produkty se nepodařilo načíst. Váš výběr zůstává zobrazený.</Copy><Button variant="secondary" onClick={result.reload}>Zkusit znovu</Button></Alert>
            : result.hasMore ? <Button variant="secondary" disabled={loadingMore} onClick={result.loadMore}>Načíst další</Button> : null}
        </div>}
      </div>
    </Layout>
  </CataloguePageLayout>;
}
