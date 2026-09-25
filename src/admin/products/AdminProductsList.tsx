import { Archive, CheckCircle2, FileText } from 'lucide-react';
import styled from 'styled-components';
import { NavigationLink } from '../../design-system/components/NavigationLink';
import { StatusBadge } from '../../design-system/components/StatusBadge';
import { designTokens as t } from '../../design-system/tokens/designTokens';
import type { AdminProductListItem, AdminProductStatus } from '../api/products';
import { buildAdminProductDetailPath } from '../navigation/adminRoutes';
import {
  formatProductUpdatedAt,
  productCategoryLabel,
  productGenderLabel,
  statusPresentation,
  yesNo,
} from './productListPresentation';
import { ProductThumbnail } from './ProductThumbnail';

const Surface = styled.div`
  min-inline-size: 0;
  overflow: hidden;
  border: 1px solid ${t.color.border.subtle};
  border-radius: ${t.radius[3]};
  background: ${t.color.bg.surface};
`;

const StackedList = styled.div`
  display: block;

  @media (min-width: ${t.breakpoint.lg}) {
    display: none;
  }
`;

const RowLink = styled(NavigationLink)`
  inline-size: 100%;
  min-inline-size: 0;
  padding: ${t.space[4]};
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: ${t.space[4]};
  align-items: start;
  color: ${t.color.text.primary};
  border-block-end: 1px solid ${t.color.border.subtle};

  &:last-child { border-block-end: 0; }
  &:hover { color: ${t.color.text.primary}; background: ${t.color.bg.subtle}; }

  @media (min-width: ${t.breakpoint.md}) {
    padding: ${t.space[3]};
  }
`;

const RowContent = styled.div`
  min-inline-size: 0;
  display: grid;
  gap: ${t.space[2]};
`;

const ProductName = styled.span`
  min-inline-size: 0;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  color: ${t.color.text.primary};
  font-size: ${t.type.bodyMd.size};
  line-height: ${t.type.bodyMd.lineHeight};
  font-weight: ${t.font.weight.semibold};
`;

const Slug = styled.span`
  display: none;
  color: ${t.color.text.secondary};
  font-size: ${t.type.caption.size};
  line-height: ${t.type.caption.lineHeight};
  overflow-wrap: anywhere;

  @media (min-width: ${t.breakpoint.md}) and (max-width: 1023px) {
    display: block;
  }
`;

const StackedMeta = styled.dl`
  margin: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${t.space[2]} ${t.space[3]};
`;

const Meta = styled.div<{ $wide?: boolean }>`
  min-inline-size: 0;
  grid-column: ${({ $wide }) => ($wide ? '1 / -1' : 'auto')};
`;

const MetaLabel = styled.dt`
  margin: 0 0 ${t.space[1]};
  color: ${t.color.text.secondary};
  font-size: ${t.type.caption.size};
  line-height: ${t.type.caption.lineHeight};
  font-weight: ${t.font.weight.semibold};
`;

const MetaValue = styled.dd`
  margin: 0;
  color: ${t.color.text.primary};
  font-size: ${t.type.bodySm.size};
  line-height: ${t.type.bodySm.lineHeight};
`;

const Offer = styled.div`
  display: grid;
  gap: ${t.space[1]};
  font-size: ${t.type.bodySm.size};
  line-height: ${t.type.bodySm.lineHeight};
`;

const TableWrap = styled.div`
  display: none;

  @media (min-width: ${t.breakpoint.lg}) {
    display: block;
  }
`;

const Table = styled.table`
  inline-size: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  font-family: ${t.font.family.ui};
`;

const HeaderCell = styled.th`
  padding: ${t.space[2]} ${t.space[3]};
  text-align: start;
  color: ${t.color.text.secondary};
  font-size: ${t.type.caption.size};
  line-height: ${t.type.caption.lineHeight};
  font-weight: ${t.font.weight.semibold};
  border-block-end: 1px solid ${t.color.border.subtle};
`;

const Cell = styled.td`
  min-inline-size: 0;
  padding: ${t.space[2]} ${t.space[3]};
  vertical-align: middle;
  color: ${t.color.text.primary};
  font-size: ${t.type.bodySm.size};
  line-height: ${t.type.bodySm.lineHeight};
  border-block-end: 1px solid ${t.color.border.subtle};

  tbody tr:last-child & { border-block-end: 0; }
`;

const ProductHeader = styled(HeaderCell)`
  inline-size: 42%;
  @media (min-width: ${t.breakpoint.xl}) { inline-size: 32%; }
`;

const StatusHeader = styled(HeaderCell)`
  inline-size: 15%;
  @media (min-width: ${t.breakpoint.xl}) { inline-size: 13%; }
`;

const OfferHeader = styled(HeaderCell)`
  inline-size: 22%;
  @media (min-width: ${t.breakpoint.xl}) { inline-size: 17%; }
`;

const UpdatedHeader = styled(HeaderCell)`
  inline-size: 21%;
  @media (min-width: ${t.breakpoint.xl}) { inline-size: 16%; }
`;

const FullHeader = styled(HeaderCell)`
  display: none;
  inline-size: 11%;

  @media (min-width: ${t.breakpoint.xl}) {
    display: table-cell;
  }
`;

const FullCell = styled(Cell)`
  display: none;

  @media (min-width: ${t.breakpoint.xl}) {
    display: table-cell;
  }
`;

const ProductIdentity = styled(NavigationLink)`
  min-inline-size: 0;
  display: flex;
  align-items: center;
  gap: ${t.space[3]};
  color: ${t.color.text.primary};

  &:hover { color: ${t.color.text.primary}; }
`;

const ProductText = styled.span`
  min-inline-size: 0;
  display: grid;
  gap: ${t.space[1]};
`;

const DesktopSlug = styled.span`
  display: none;
  color: ${t.color.text.secondary};
  font-size: ${t.type.caption.size};
  line-height: ${t.type.caption.lineHeight};
  overflow-wrap: anywhere;

  @media (min-width: ${t.breakpoint.xl}) {
    display: block;
  }
`;

const CompactMetadata = styled.span`
  color: ${t.color.text.secondary};
  font-size: ${t.type.caption.size};
  line-height: ${t.type.caption.lineHeight};

  @media (min-width: ${t.breakpoint.xl}) {
    display: none;
  }
`;

const Updated = styled.time`
  color: ${t.color.text.secondary};
  font-size: ${t.type.bodySm.size};
  line-height: ${t.type.bodySm.lineHeight};
`;

function Status({ status }: { status: AdminProductStatus }) {
  const presentation = statusPresentation[status];
  const icon =
    status === 'active' ? (
      <CheckCircle2 aria-hidden="true" />
    ) : status === 'archived' ? (
      <Archive aria-hidden="true" />
    ) : (
      <FileText aria-hidden="true" />
    );

  return (
    <StatusBadge tone={presentation.tone} icon={icon}>
      {presentation.label}
    </StatusBadge>
  );
}

function OfferState({ product }: { product: AdminProductListItem }) {
  return (
    <Offer>
      <span>Pronájem: {yesNo(product.rentalEnabled)}</span>
      <span>Prodej: {yesNo(product.saleEnabled)}</span>
    </Offer>
  );
}

function ProductUpdatedAt({ product }: { product: AdminProductListItem }) {
  return <Updated dateTime={product.updatedAt}>{formatProductUpdatedAt(product.updatedAt)}</Updated>;
}

export function AdminProductsList({ products }: { products: AdminProductListItem[] }) {
  return (
    <Surface data-admin-products-list>
      <StackedList data-admin-products-stacked>
        {products.map(product => (
          <RowLink
            key={product.id}
            variant="plain"
            to={buildAdminProductDetailPath(product.id)}
            data-product-row
          >
            <ProductThumbnail photo={product.photos?.[0]} />
            <RowContent>
              <ProductName>{product.name}</ProductName>
              {product.slug ? <Slug>{product.slug}</Slug> : null}
              <Status status={product.status} />
              <StackedMeta>
                <Meta>
                  <MetaLabel>Kategorie</MetaLabel>
                  <MetaValue>{productCategoryLabel(product.category)}</MetaValue>
                </Meta>
                <Meta>
                  <MetaLabel>Určení</MetaLabel>
                  <MetaValue>{productGenderLabel(product.gender)}</MetaValue>
                </Meta>
                <Meta $wide>
                  <MetaLabel>Nabídka</MetaLabel>
                  <MetaValue as="div"><OfferState product={product} /></MetaValue>
                </Meta>
                <Meta $wide>
                  <MetaLabel>Aktualizováno</MetaLabel>
                  <MetaValue as="div"><ProductUpdatedAt product={product} /></MetaValue>
                </Meta>
              </StackedMeta>
            </RowContent>
          </RowLink>
        ))}
      </StackedList>

      <TableWrap data-admin-products-table>
        <Table>
          <thead>
            <tr>
              <ProductHeader scope="col">Produkt</ProductHeader>
              <StatusHeader scope="col">Stav</StatusHeader>
              <FullHeader scope="col">Kategorie</FullHeader>
              <FullHeader scope="col">Určení</FullHeader>
              <OfferHeader scope="col">Nabídka</OfferHeader>
              <UpdatedHeader scope="col">Aktualizováno</UpdatedHeader>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id} data-product-row>
                <Cell>
                  <ProductIdentity variant="plain" to={buildAdminProductDetailPath(product.id)}>
                    <ProductThumbnail photo={product.photos?.[0]} />
                    <ProductText>
                      <ProductName>{product.name}</ProductName>
                      {product.slug ? <DesktopSlug>{product.slug}</DesktopSlug> : null}
                      <CompactMetadata>
                        {productCategoryLabel(product.category)} · {productGenderLabel(product.gender)}
                      </CompactMetadata>
                    </ProductText>
                  </ProductIdentity>
                </Cell>
                <Cell><Status status={product.status} /></Cell>
                <FullCell>{productCategoryLabel(product.category)}</FullCell>
                <FullCell>{productGenderLabel(product.gender)}</FullCell>
                <Cell><OfferState product={product} /></Cell>
                <Cell><ProductUpdatedAt product={product} /></Cell>
              </tr>
            ))}
          </tbody>
        </Table>
      </TableWrap>
    </Surface>
  );
}
