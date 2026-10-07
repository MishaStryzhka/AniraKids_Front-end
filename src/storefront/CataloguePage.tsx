import { useEffect, useRef, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { Button } from '../design-system/components/Button';
import { Input } from '../design-system/components/Input';
import { designTokens as t } from '../design-system/tokens/designTokens';
import {
  getCatalogue,
  PublicApiError,
  type CatalogueQuery,
  type ProductCard,
} from './api/publicApi';
import { usePublicRead } from './usePublicRead';
import {
  Actions,
  Alert,
  Copy,
  Heading,
  Page,
  RouteLink,
  Stack,
  Title,
} from './storefrontStyles';
import { productPath, routes } from '../navigation/routes';
const Grid = styled.ul`
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
const Cover = styled.div`
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
export function ProductImage({ product }: { product: ProductCard }) {
  const [failed, setFailed] = useState(false);
  const url = product.photos[0]?.url;
  useEffect(() => setFailed(false), [url]);
  return (
    <Cover>
      {url && !failed ? (
        <img
          src={url}
          alt={product.photos[0].alt || product.name}
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        <Copy>Fotografie není k dispozici.</Copy>
      )}
    </Cover>
  );
}
export function CataloguePage() {
  const { pathname } = useLocation(),
    [params, setParams] = useSearchParams(),
    isSearch = pathname === routes.search;
  const q = isSearch ? (params.get('q') ?? '').trim() : '';
  const rawPage = params.get('page') ?? '1',
    page =
      /^[1-9]\d*$/.test(rawPage) && Number(rawPage) <= 10000
        ? Number(rawPage)
        : 1;
  const [query, setQuery] = useState(q);
  useEffect(() => setQuery(q), [q]);
  const title =
    pathname === routes.dresses
      ? 'Dívčí šaty'
      : pathname === routes.suits
        ? 'Chlapecké obleky'
        : pathname === routes.newArrivals
          ? 'Novinky'
          : isSearch
            ? 'Hledání'
            : 'Pronájem';
  const request: CatalogueQuery = {
    ...(pathname === routes.dresses
      ? { category: 'dress' as const }
      : pathname === routes.suits
        ? { category: 'suit' as const }
        : {}),
    ...(q ? { q } : {}),
    sort: pathname === routes.newArrivals ? 'newest' : 'name',
    page,
    limit: 12,
  };
  const invalid = q.length > 100;
  const result = usePublicRead(
    invalid ? null : JSON.stringify(request),
    signal => getCatalogue(request, signal)
  );
  const heading = useRef<HTMLHeadingElement>(null);
  const navigatePage = (value: number) => {
    const next = new URLSearchParams(params);
    value === 1 ? next.delete('page') : next.set('page', String(value));
    setParams(next);
    requestAnimationFrame(() => heading.current?.focus());
  };
  return (
    <Page>
      <Title ref={heading} tabIndex={-1}>
        {title}
      </Title>
      {pathname === routes.rental ? (
        <Copy id="jak-funguje-pronajem">
          Vyberte produkt, velikost a termín. Po ověření dostupnosti vyplňte
          kontaktní údaje a odešlete rezervaci.
        </Copy>
      ) : null}
      {isSearch ? (
        <form
          onSubmit={event => {
            event.preventDefault();
            setParams(query.trim() ? { q: query.trim() } : {});
          }}
        >
          <Stack>
            <Input
              label="Hledat produkt"
              value={query}
              onChange={event => setQuery(event.target.value)}
            />
            <Actions>
              <Button type="submit">Hledat</Button>
            </Actions>
          </Stack>
        </form>
      ) : null}
      {invalid ? (
        <Alert role="alert">Hledaný výraz může mít maximálně 100 znaků.</Alert>
      ) : result.loading ? (
        <Copy role="status">Načítání produktů…</Copy>
      ) : result.error ? (
        <Alert role="alert">
          <Heading>Produkty se nepodařilo načíst</Heading>
          <Copy>
            {result.error instanceof PublicApiError &&
            result.error.code === 'NOT_CONFIGURED'
              ? 'Katalog nyní není dostupný.'
              : 'Zkuste to prosím znovu.'}
          </Copy>
          <Actions>
            <Button onClick={result.reload}>Zkusit znovu</Button>
          </Actions>
        </Alert>
      ) : result.data?.items.length ? (
        <Grid>
          {result.data.items.map(product => (
            <li key={product.id}>
              <ProductImage product={product} />
              <Heading>{product.name}</Heading>
              {product.color ? <Copy>{product.color}</Copy> : null}
              <RouteLink
                to={productPath(product.slug)}
                aria-label={`Prohlédnout ${product.name}`}
              >
                Prohlédnout
              </RouteLink>
            </li>
          ))}
        </Grid>
      ) : result.data ? (
        <Stack>
          <Copy>
            {result.data.total > 0
              ? 'Na této stránce nejsou žádné produkty.'
              : 'Momentálně nejsou dostupné žádné produkty.'}
          </Copy>
          {page > 1 ? (
            <Actions>
              <Button variant="secondary" onClick={() => navigatePage(1)}>
                První stránka
              </Button>
            </Actions>
          ) : null}
        </Stack>
      ) : null}
      {result.data && result.data.totalPages > 1 ? (
        <Actions aria-label="Stránkování">
          <Button
            variant="secondary"
            disabled={page <= 1}
            onClick={() => navigatePage(page - 1)}
          >
            Předchozí
          </Button>
          <Copy aria-live="polite">
            Stránka {page} z {result.data.totalPages}
          </Copy>
          <Button
            variant="secondary"
            disabled={page >= result.data.totalPages}
            onClick={() => navigatePage(page + 1)}
          >
            Další
          </Button>
        </Actions>
      ) : null}
    </Page>
  );
}
