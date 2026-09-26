import { useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { Button } from '../../design-system/components/Button';
import { NavigationLink } from '../../design-system/components/NavigationLink';
import { Pagination } from '../../design-system/components/Pagination';
import { Spinner } from '../../design-system/components/Spinner';
import { designTokens as t } from '../../design-system/tokens/designTokens';
import { useAuth } from '../../hooks/useAuth';
import { listAdminProducts, type AdminProductListResponse } from '../api/products';
import { normalizeAdminApiError } from '../api/errors';
import { useAdminPageAction } from '../layout/AdminLayout';
import { adminRoutes } from '../navigation/adminRoutes';
import { AdminProductsFilters } from './AdminProductsFilters';
import { AdminProductsList } from './AdminProductsList';
import {
  buildProductListSearchParams,
  canonicalizeProductListSearchParams,
  countActiveProductFilters,
  toAdminProductListQuery,
  type ProductListUrlState,
} from './productListSearchParams';
import { useSearchParams } from 'react-router-dom';

const Page = styled.div`
  min-inline-size: 0;
  display: grid;
  gap: ${t.space[6]};
`;

const CreateLink = styled(NavigationLink)`
  min-block-size: ${t.control.height.default};
  padding-inline: ${t.component.button.paddingInline.default};
  border-radius: ${t.component.button.radius};
  justify-content: center;
  color: ${t.color.action.primary.fg};
  background: ${t.color.action.primary.bg};
  font-size: ${t.type.button.size};
  line-height: ${t.type.button.lineHeight};
  font-weight: ${t.type.button.weight};
  letter-spacing: ${t.type.button.letterSpacing};

  &&:hover {
    color: ${t.color.action.primary.fg};
    background: ${t.color.action.primary.bgHover};
  }

  &&:active {
    color: ${t.color.action.primary.fg};
    background: ${t.color.action.primary.bgActive};
  }
`;

const ProductCount = styled.p`
  margin: 0;
  color: ${t.color.text.secondary};
  font-size: ${t.type.bodySm.size};
  line-height: ${t.type.bodySm.lineHeight};
`;

const Results = styled.section`
  min-inline-size: 0;
  min-block-size: 240px;
`;

const StatePanel = styled.div`
  min-block-size: 240px;
  padding: ${t.space[8]} ${t.space[4]};
  display: grid;
  place-items: center;
  text-align: center;
  border: 1px solid ${t.color.border.subtle};
  border-radius: ${t.radius[3]};
  background: ${t.color.bg.surface};
`;

const StateContent = styled.div`
  max-inline-size: 520px;
  display: grid;
  justify-items: center;
  gap: ${t.space[3]};
`;

const StateTitle = styled.h2`
  margin: 0;
  color: ${t.color.text.primary};
  font-family: ${t.font.family.ui};
  font-size: ${t.type.bodyLg.size};
  line-height: ${t.type.bodyLg.lineHeight};
  font-weight: ${t.font.weight.semibold};
`;

const StateText = styled.p`
  margin: 0;
  color: ${t.color.text.secondary};
  font-size: ${t.type.bodyMd.size};
  line-height: ${t.type.bodyMd.lineHeight};
`;

const LoadingLine = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${t.space[3]};
  color: ${t.color.text.secondary};
`;

const PaginationWrap = styled.div`
  margin-block-start: ${t.space[6]};
`;

type RequestState =
  | { status: 'loading' }
  | { status: 'success'; data: AdminProductListResponse; queryKey: string }
  | { status: 'error' };

const paginationLabels = {
  previous: 'Předchozí',
  next: 'Další',
  navigation: 'Stránkování produktů',
  goToPage: (page: number) => `Přejít na stránku ${page}`,
  currentPage: (page: number) => `Stránka ${page}, aktuální`,
};

export function AdminProductsPage() {
  const { token } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [retryRevision, setRetryRevision] = useState(0);
  const [requestState, setRequestState] = useState<RequestState>({ status: 'loading' });
  const requestSequenceRef = useRef(0);
  const skipFetchForCanonicalKeyRef = useRef<string | null>(null);

  const pageAction = useMemo(
    () => (
      <CreateLink variant="plain" to={adminRoutes.productNew}>
        Přidat produkt
      </CreateLink>
    ),
    []
  );
  useAdminPageAction(pageAction);

  const rawSearchKey = searchParams.toString();
  const canonical = useMemo(
    () => canonicalizeProductListSearchParams(new URLSearchParams(rawSearchKey)),
    [rawSearchKey]
  );
  const canonicalKey = canonical.searchParams.toString();

  useEffect(() => {
    if (!canonical.changed) return;
    setSearchParams(canonical.searchParams, { replace: true });
  }, [canonical.changed, canonical.searchParams, setSearchParams]);

  useEffect(() => {
    if (canonical.changed || !token) return;

    if (skipFetchForCanonicalKeyRef.current === canonicalKey) {
      skipFetchForCanonicalKeyRef.current = null;
      return;
    }

    const controller = new AbortController();
    const requestSequence = ++requestSequenceRef.current;
    setRequestState({ status: 'loading' });

    listAdminProducts({
      token,
      signal: controller.signal,
      query: toAdminProductListQuery(canonical.state),
    })
      .then(data => {
        if (controller.signal.aborted || requestSequence !== requestSequenceRef.current) return;

        const { total, pages } = data.pagination;
        const requestedPage = canonical.state.page;

        if (total > 0 && requestedPage > pages) {
          setSearchParams(
            buildProductListSearchParams({ ...canonical.state, page: pages }),
            { replace: true }
          );
          return;
        }

        if (total === 0 && pages === 0 && requestedPage !== 1) {
          const normalized = buildProductListSearchParams({ ...canonical.state, page: 1 });
          skipFetchForCanonicalKeyRef.current = normalized.toString();
          setRequestState({ status: 'success', data, queryKey: normalized.toString() });
          setSearchParams(normalized, { replace: true });
          return;
        }

        setRequestState({ status: 'success', data, queryKey: canonicalKey });
      })
      .catch(error => {
        if (controller.signal.aborted || requestSequence !== requestSequenceRef.current) return;
        const normalized = normalizeAdminApiError(error);
        if (normalized.kind === 'cancelled') return;
        setRequestState({ status: 'error' });
      });

    return () => {
      controller.abort();
    };
  }, [
    canonical.changed,
    canonical.state,
    canonicalKey,
    retryRevision,
    setSearchParams,
    token,
  ]);

  const updateFilters = (patch: Partial<ProductListUrlState>) => {
    setSearchParams(
      buildProductListSearchParams({
        ...canonical.state,
        ...patch,
        page: 1,
      })
    );
  };

  const clearFilters = () => {
    setSearchParams(buildProductListSearchParams({ page: 1 }));
  };

  const changePage = (page: number) => {
    if (page === canonical.state.page) return;
    setSearchParams(buildProductListSearchParams({ ...canonical.state, page }));
  };

  const activeFilterCount = countActiveProductFilters(canonical.state);
  const currentData =
    requestState.status === 'success' && requestState.queryKey === canonicalKey
      ? requestState.data
      : null;
  const pendingQuery =
    requestState.status === 'loading' ||
    (requestState.status === 'success' && requestState.queryKey !== canonicalKey);

  return (
    <Page data-admin-products-page>
      <AdminProductsFilters
        state={canonical.state}
        expanded={filtersExpanded}
        onToggle={() => setFiltersExpanded(value => !value)}
        onChange={updateFilters}
        onClear={clearFilters}
      />

      <ProductCount data-admin-products-count>
        Počet produktů: {currentData ? currentData.pagination.total : '…'}
      </ProductCount>

      <Results
        aria-busy={pendingQuery || undefined}
        aria-live="polite"
        data-admin-products-results
      >
        {pendingQuery ? (
          <StatePanel role="status">
            <LoadingLine>
              <Spinner size="md" />
              <span>Načítání produktů…</span>
            </LoadingLine>
          </StatePanel>
        ) : null}

        {requestState.status === 'error' ? (
          <StatePanel role="alert">
            <StateContent>
              <StateTitle>Produkty se nepodařilo načíst</StateTitle>
              <StateText>Zkuste to prosím znovu.</StateText>
              <Button onClick={() => setRetryRevision(value => value + 1)}>
                Zkusit znovu
              </Button>
            </StateContent>
          </StatePanel>
        ) : null}

        {currentData && currentData.pagination.total === 0 ? (
          <StatePanel>
            <StateContent>
              {activeFilterCount === 0 ? (
                <>
                  <StateTitle>Zatím tu nejsou žádné produkty</StateTitle>
                  <StateText>Přidejte první produkt a začněte vytvářet katalog.</StateText>
                  <CreateLink variant="plain" to={adminRoutes.productNew}>
                    Přidat první produkt
                  </CreateLink>
                </>
              ) : (
                <>
                  <StateTitle>Žádné produkty neodpovídají vybraným filtrům</StateTitle>
                  <StateText>Zkuste filtry upravit nebo je zrušte.</StateText>
                  <Button variant="secondary" onClick={clearFilters}>
                    Zrušit filtry
                  </Button>
                </>
              )}
            </StateContent>
          </StatePanel>
        ) : null}

        {currentData && currentData.pagination.total > 0 ? (
          <>
            <AdminProductsList products={currentData.items} />
            <PaginationWrap>
              <Pagination
                page={currentData.pagination.page}
                pages={currentData.pagination.pages}
                onPageChange={changePage}
                labels={paginationLabels}
              />
            </PaginationWrap>
          </>
        ) : null}
      </Results>
    </Page>
  );
}
