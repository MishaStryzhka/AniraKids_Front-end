import {useSiteSettings,SiteSectionGate} from '../siteSettings/SiteSettingsProvider';
import type {SectionKey,FilterKey} from '../siteSettings/siteSettings';
import { ArrowUpDown, SlidersHorizontal } from 'lucide-react';
import { IconButton } from '../design-system/components/IconButton';
import { ColorPalette } from '../design-system/components/ColorPalette/ColorPalette';
import { ResumeReservationLink } from './booking/ResumeReservationLink';
import { FavoriteButton, FavoritesFeedback } from './favorites/FavoriteButton';
import IconBeauty from '../images/icons/IconBeauty';
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
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: ${t.space[2]};
  padding-block-end: ${t.space[4]};
  border-bottom: 1px solid ${t.color.border.subtle};
`;
const CatalogueTitle = styled(Title)`
  min-width: 0;
  overflow-wrap: anywhere;
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
const Layout = styled.div<{ $filtersOpen: boolean }> `
  display: flex;
  flex-direction: column;
  gap: ${t.space[4]};
  min-width: 0;
  @media (min-width: ${t.breakpoint.md}) {
    display: grid;
    grid-template-columns: ${p => p.$filtersOpen ? '220px minmax(0, 1fr)' : 'minmax(0, 1fr)'};
    grid-template-rows: auto 1fr;
    grid-template-areas: ${p => p.$filtersOpen ? "'filters toolbar' 'filters products'" : "'toolbar' 'products'"};
    column-gap: ${t.space[8]};
    align-items: start;
  }
`;
const Products = styled.div`
  grid-area: products;
  min-width: 0;
`;

const Filters = styled.form<{
    $open: boolean;
}> `
  grid-area: filters;
  display: ${({ $open }) => $open ? 'grid' : 'none'};
  gap: 16px;
  align-content: start;
  min-width: 0;

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
const Toolbar = styled.div`
  grid-area: toolbar;
  min-width: 0;
`;
const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${t.space[2]};
`;
const FilterToggle = styled(IconButton)`position: relative;`;
const FilterCount = styled.span`
  position: absolute;
  inset-block-start: 0;
  inset-inline-end: 0;
  min-width: 16px;
  height: 16px;
  padding-inline: 3px;
  display: grid;
  place-items: center;
  border-radius: ${t.radius.full};
  font-size: 10px;
  line-height: 1;
  background: ${t.color.action.primary.bg};
  color: ${t.color.action.primary.fg};
`;
const SortControl = styled.label`
  position: relative;
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  border-radius: ${t.component.iconButton.radius};
  color: ${t.color.action.ghost.fg};
  &:hover { background: ${t.color.action.ghost.bgHover}; }
  &:focus-within { outline: 2px solid ${t.color.focus.ring}; outline-offset: 2px; }
  select {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
  }
  svg { pointer-events: none; }
`;
const Empty = styled.div `
  min-height: 300px; display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 20px; text-align: center;
`;
const filterKeys = ['category', 'gender', 'color', 'size', 'rentalMode', 'minPrice', 'maxPrice'] as const;
const categories = [['dress', 'Šaty'], ['suit', 'Obleky'], ['set', 'Soupravy'], ['accessory', 'Doplňky'], ['other', 'Ostatní']];
const genders = [['girls', 'Dívky'], ['boys', 'Chlapci'], ['women', 'Ženy'], ['men', 'Muži'], ['unisex', 'Unisex'], ['children', 'Děti']];
const sorts = [['name', 'Podle názvu'], ['newest', 'Nejnovější'], ['priceAsc', 'Cena od nejnižší'], ['priceDesc', 'Cena od nejvyšší']];
function sectionFor(path:string,search:string):SectionKey|null{
 return path===routes.dresses?'girlsDresses':path===routes.suits?'suits':path===routes.familyLooks?'familyLooks':path.split('/')[1]==='forWomen'&&new URLSearchParams(search).get('category')==='dress'?'womenDresses':null;
}
export function CataloguePage(){const {pathname,search}=useLocation();const section=sectionFor(pathname,search);return section?<SiteSectionGate section={section}><CatalogueContent/></SiteSectionGate>:<CatalogueContent/>;}
function CatalogueContent() {
    const { pathname, search } = useLocation();
    const [params, setParams] = useSearchParams();
    const isFamily = pathname === routes.familyLooks;
    const isSearch = pathname === routes.search;
    const root = '/' + pathname.split('/')[1];
    const legacy = root === '/forWomen' ? { title: 'Dámské oblečení', gender: 'women' } :
        root === '/forMen' ? { title: 'Pánské oblečení', gender: 'men' } :
            root === '/forChildren' ? { title: 'Dětské oblečení', gender: 'children' } : null;
    const isWomenDresses = root === '/forWomen' && params.get('category') === 'dress';
    const {filters}=useSiteSettings();
    const section=sectionFor(pathname,search);
    const allowed=section?filters[section]:['category','gender','price','rentalMode','color','size'];
    const visible=(key:string)=>allowed.includes((key==='minPrice'||key==='maxPrice'?'price':key) as FilterKey);
    const allowedKey=allowed.join(',');
    const fixedCategory = pathname === routes.dresses || isWomenDresses ? 'dress' : pathname === routes.suits ? 'suit' : root === '/decorAndToys' ? 'accessory' : '';
    const fixedGender = pathname === routes.dresses ? 'girls' : legacy?.gender;
    const title = isFamily ? 'Family looky' : (isWomenDresses ? 'Dámské šaty' : legacy?.title) || (fixedCategory === 'dress' ? 'Dívčí šaty' : fixedCategory === 'suit' ? 'Obleky' : fixedCategory === 'accessory' ? 'Doplňky' : root === '/popular' || pathname === routes.newArrivals ? 'Novinky' : isSearch ? 'Hledání' : 'Pronájem');
    const q = (params.get('q') || '').trim();
    useEffect(() => {
      if (params.has('familyLook') || params.has('page') || (pathname === routes.dresses && params.has('gender'))) {
        const next = new URLSearchParams(params);
        next.delete('page');
        next.delete('familyLook');
        if (pathname === routes.dresses) next.delete('gender');
        setParams(next, { replace: true });
      }
    }, [params, setParams, pathname]);
    useEffect(()=>{const next=new URLSearchParams(params);let changed=false;for(const key of filterKeys){if(!visible(key)&&!(key==='category'&&isWomenDresses)&&next.has(key)){next.delete(key);changed=true;}}if(changed)setParams(next,{replace:true});},[params,setParams,allowedKey,isWomenDresses]); // eslint-disable-line react-hooks/exhaustive-deps
    const sort = params.get('sort') || (title === 'Novinky' ? 'newest' : 'name');
    const serialized = params.toString();
    const readFilters = () => Object.fromEntries(filterKeys.map(key => [key, (visible(key)?params.get(key):'') || (key === 'rentalMode' ? 'studio' : '')]));
    const [draft, setDraft] = useState(readFilters);
    const [query, setQuery] = useState(q);
    const [open, setOpen] = useState(false);
    const [formError, setFormError] = useState('');
    useEffect(() => { setDraft(Object.fromEntries(filterKeys.map(key => [key, new URLSearchParams(serialized).get(key) || (key === 'rentalMode' ? 'studio' : '')]))); setFormError(''); }, [serialized, pathname]);
    useEffect(() => setQuery(q), [q]);
    const request: CatalogueQuery = { sort: sort as CatalogueQuery['sort'], page: 1, limit: 12 };
    for (const key of filterKeys) {
        const value = params.get(key);
        if (value && visible(key))
            Object.assign(request, { [key]: key === 'minPrice' || key === 'maxPrice' ? Number(value) : value });
    }
    if (isFamily) request.familyLook = 'true';
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
            (request.color?.length || 0) > 80 || (request.size?.length || 0) > 80 ? 'Neplatné filtry. Obnovte prosím výchozí nastavení.' : '');
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
    const activeFilterCount = filterKeys.filter(key => {
      const value = params.get(key);
      if (!visible(key) || !value || (key === 'category' && fixedCategory) || (key === 'gender' && fixedGender)) return false;
      return key !== 'rentalMode' || value !== 'studio';
    }).length;

    const update = (key: string, value: string) => setDraft(previous => ({ ...previous, [key]: value }));
    const reset = () => { const next = new URLSearchParams(); if(isWomenDresses)next.set('category','dress'); if (q)
        next.set('q', q); setParams(next); setDraft(Object.fromEntries(filterKeys.map(key => [key, key === 'rentalMode' ? 'studio' : '']))); setFormError(''); };
    const options = (values: string[], selected: string) => Array.from(new Set([...values, ...(selected ? [selected] : [])])).map(value => <option key={value} value={value}>{value}</option>);
    return <CataloguePageLayout>
    <Breadcrumbs items={[{ label: 'Domů', to: routes.home }, { label: title }]}/>
    <CatalogueHeader>
      <CatalogueTitle ref={heading} tabIndex={-1}>{title}</CatalogueTitle>
      <HeaderActions>
        {allowed.length>0&&<FilterToggle aria-label="Filtrovat" title={activeFilterCount ? `Filtrovat (${activeFilterCount})` : 'Filtrovat'}
          aria-expanded={open} aria-controls="catalogue-filters" onClick={() => setOpen(value => !value)}
          aria-describedby={activeFilterCount ? 'catalogue-filter-count' : undefined}
          icon={<><SlidersHorizontal size={22} aria-hidden="true"/>{activeFilterCount > 0 ? <FilterCount id="catalogue-filter-count">{activeFilterCount}<span style={{position:'absolute',width:1,height:1,overflow:'hidden',clip:'rect(0,0,0,0)'}}> aktivních filtrů</span></FilterCount> : null}</>}/>}
        <SortControl title={`Seřadit podle: ${sorts.find(([value]) => value === sort)?.[1] || sort}`}>
          <ArrowUpDown size={22} strokeWidth={1.7} aria-hidden="true"/>
          <select aria-label="SEŘADIT PODLE" value={sort} onChange={event => { const next = new URLSearchParams(params); next.set('sort', event.target.value); next.delete('page');
        next.delete('familyLook'); setParams(next); }}>
            {sorts.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </SortControl>
      </HeaderActions>
    </CatalogueHeader>
    {pathname === routes.rental && <Copy id="jak-funguje-pronajem">Vyberte produkt, velikost a termín. Po ověření dostupnosti vyplňte kontaktní údaje a odešlete rezervaci.</Copy>}
    {pathname.split('/').filter(Boolean).length > 1 && <Copy>Původní odkaz na produkt již není aktuální. Vyberte prosím z aktuální nabídky.</Copy>}
    {isSearch && <form onSubmit={event => { event.preventDefault(); setParams(query.trim() ? { q: query.trim() } : {}); }}><Stack><Input label="Hledat produkt" value={query} onChange={event => setQuery(event.target.value)}/><Actions><Button type="submit">Hledat</Button></Actions></Stack></form>}
    <FavoritesFeedback />
    <Layout $filtersOpen={open&&allowed.length>0}>
      <Toolbar><Copy aria-live="polite">{result.loading ? 'Načítání…' : result.data ? `Počet modelů: ${result.data.total}` : ''}</Copy></Toolbar>
      {allowed.length>0&&<Filters id="catalogue-filters" $open={open} aria-label="Filtry produktů" onSubmit={event => {
            event.preventDefault();
            const error = priceError(draft);
            setFormError(error);
            if (error)
                return;
            const next = new URLSearchParams(params);
            next.delete('page');
        next.delete('familyLook');
            filterKeys.forEach(key => { const value = (key === 'gender' && fixedGender)||!visible(key) ? '' : draft[key]; value ? next.set(key, value) : next.delete(key); });
            if(isWomenDresses)next.set('category','dress');
            setParams(next);
        }}>
        <h2>FILTROVAT</h2>
        {((!fixedCategory&&visible('category')) || (!fixedGender&&visible('gender'))) && <details><summary>TYP</summary>
          {!fixedCategory && visible('category') && <label>Kategorie<Select value={draft.category} onChange={event => update('category', event.target.value)}><option value="">Všechny</option>{categories.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select></label>}
          {!fixedGender && visible('gender') && <label>Pro koho<Select value={draft.gender} onChange={event => update('gender', event.target.value)}><option value="">Všichni</option>{genders.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select></label>}
        </details>}
        {(visible('price')||visible('rentalMode'))&&<details><summary>CENA</summary>
          {visible('rentalMode')&&<label>Způsob pronájmu<Select value={draft.rentalMode} onChange={event => update('rentalMode', event.target.value)}><option value="studio">Ve studiu</option><option value="external">Mimo studio</option></Select></label>}
          {visible('price')&&<><Input label="Cena od (Kč)" type="number" min="0" max="9999999" step="1" value={draft.minPrice} onChange={event => update('minPrice', event.target.value)}/>
          <Input label="Cena do (Kč)" type="number" min="0" max="9999999" step="1" value={draft.maxPrice} onChange={event => update('maxPrice', event.target.value)}/>
          <Copy>Cena pronájmu bez vratné kauce.</Copy></>}
        </details>}
        {visible('color')&&<details><summary>BARVA</summary><ColorPalette label="Paleta barev pro filtrování" colors={result.data?.facets?.colors || []} selected={draft.color ? [draft.color] : []} onToggle={color=>update('color', draft.color===color?'':color)}/><label>Barva<Select value={draft.color} onChange={event => update('color', event.target.value)}><option value="">Všechny barvy</option>{options(result.data?.facets?.colors || [], draft.color)}</Select></label></details>}
        {visible('size')&&<details><summary>VELIKOST</summary><label>Velikost<Select value={draft.size} onChange={event => update('size', event.target.value)}><option value="">Všechny velikosti</option>{options(result.data?.facets?.sizes || [], draft.size)}</Select></label></details>}
        {formError && <Alert role="alert">{formError}</Alert>}
        <Button type="submit">Použít filtry</Button><Button type="button" variant="secondary" onClick={reset}>Zrušit filtry</Button>
      </Filters>}
      <Products>

        {invalid ? <Alert role="alert">{invalid}<Button variant="secondary" onClick={reset}>Zrušit filtry</Button></Alert> : result.loading ? <Copy role="status">Načítání produktů…</Copy> : result.error && !result.data ? <Alert role="alert"><Heading>Produkty se nepodařilo načíst</Heading><Copy>{result.error instanceof PublicApiError && result.error.code === 'NOT_CONFIGURED' ? 'Katalog nyní není dostupný.' : 'Zkuste to prosím znovu.'}</Copy><Button onClick={result.reload}>Zkusit znovu</Button></Alert> : result.data?.items.length ? <Grid>{result.data.items.map(product => <li key={product.id}>
          <div style={{ position: 'relative' }}><span style={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}><FavoriteButton id={product.id} name={product.name} /></span><RouteLink to={productPath(product.slug)}
                  state={{ catalogueReturnTo: pathname + search }} aria-label={`Prohlédnout ${product.name}`} style={{ display: 'block', padding: 0 }}><ProductImage product={product}/></RouteLink></div><Heading>{product.name}</Heading>
          {product.color && <Copy>{product.color}</Copy>}
          {product.rentalPriceFrom !== undefined && <Copy>Od {product.rentalPriceFrom.toLocaleString('cs-CZ')} Kč · {request.rentalMode === 'external' ? 'mimo studio' : 've studiu'}</Copy>}
          <ResumeReservationLink productId={product.id} catalogueReturnTo={pathname + search} />
        </li>)}</Grid> : result.data ? <Empty><IconBeauty className="catalogue-empty-illustration" aria-hidden="true"/><Copy>Pro zvolené filtry jsme nenašli žádné produkty.</Copy><Button variant="secondary" onClick={reset}>Zrušit filtry</Button></Empty> : null}
        {result.data && result.data.items.length > 0 && <div ref={sentinel} style={{ paddingBlock: 24 }}>
          <Copy role="status">{loadingMore ? 'Načítání dalších produktů…' : `Zobrazeno ${result.data.items.length} z ${result.data.total} modelů`}</Copy>
          {result.error ? <Alert role="alert"><Copy>Další produkty se nepodařilo načíst. Váš výběr zůstává zobrazený.</Copy><Button variant="secondary" onClick={result.reload}>Zkusit znovu</Button></Alert>
            : result.hasMore ? <Button variant="secondary" disabled={loadingMore} onClick={result.loadMore}>Načíst další</Button> : null}
        </div>}
      </Products>
    </Layout>
  </CataloguePageLayout>;
}
