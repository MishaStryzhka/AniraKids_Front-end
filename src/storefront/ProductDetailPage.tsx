import styled from 'styled-components';
import { designTokens as t } from '../design-system/tokens/designTokens';
import {trackProduct, CONSENT_EVENT} from '../analytics/analytics';
import {useSiteSettings} from '../siteSettings/SiteSettingsProvider';
import { useProductSeo } from '../seo/useProductSeo';
import { draftItems } from './booking/bookingModel';
import { ResumeReservationLink } from './booking/ResumeReservationLink';
import { FavoritesFeedback } from './favorites/FavoriteButton';
import { ProductShareActions } from './ProductShareActions';
import { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button } from '../design-system/components/Button';
import { useStorefrontOutletContext } from '../layouts/StorefrontLayout';
import { routes } from '../navigation/routes';
import { getCatalogueReturnTo } from './catalogueNavigation';
import { getPublicProduct, PublicApiError } from './api/publicApi';
import { useBooking } from './booking/BookingProvider';
import { formatMoney, modeLabel, statusLabel } from './booking/bookingModel';
import { ProductGallery } from './ProductGallery';
import {
  Actions,
  Alert,
  Columns,
  Copy,
  Facts,
  Heading,
  Page,
  Panel,
  RouteLink,
  Stack,
  Title,
} from './storefrontStyles';
import { usePublicRead } from './usePublicRead';
const FittingPrice = styled(Facts)`
  padding-block-start: ${t.space[4]};
  border-block-start: 1px solid ${t.color.border.subtle};
  font-weight: 600;
`;
const BookingSection = styled(Stack)`
  gap: ${t.space[3]};
`;
const RentalSection = styled(BookingSection)`
  margin-block-start: ${t.space[2]};
  padding-block-start: ${t.space[6]};
  border-block-start: 1px solid ${t.color.border.subtle};
`;
const ProductActions = styled(Actions)`
  > button, > a {
    box-sizing: border-box;
    inline-size: 240px;
    max-inline-size: 100%;
    min-block-size: ${t.control.height.default};
    padding: ${t.space[3]} ${t.component.button.paddingInline.default};
    font-family: ${t.font.family.ui};
    font-size: ${t.type.button.size};
    line-height: ${t.type.button.lineHeight};
    font-weight: ${t.type.button.weight};
    letter-spacing: ${t.type.button.letterSpacing};
    border-radius: ${t.component.button.radius};
  }
  @media (max-width: 767px) {
    > button, > a { inline-size: 100%; }
  }
`;
export function ProductDetailPage() {
  const { slug = '' } = useParams(),
    navigate = useNavigate(),
    location = useLocation(),
    booking = useBooking(),
    { setProductPrimaryCategory } = useStorefrontOutletContext();
  const result = usePublicRead(slug, signal => getPublicProduct(slug, signal));
  const product = result.data;
  useProductSeo(product);
  const analyticsProductId = product?.id;
  useEffect(() => {
    const track = () => { if (analyticsProductId) trackProduct('view_item', analyticsProductId); };
    track(); window.addEventListener(CONSENT_EVENT, track);
    return () => window.removeEventListener(CONSENT_EVENT, track);
  }, [analyticsProductId]);
  const {sections}=useSiteSettings();
  const previousCatalogue=getCatalogueReturnTo(location.state, product?.category);
  const previousPath=previousCatalogue.split('?')[0];
  const catalogueReturnTo=(previousPath===routes.dresses&&!sections.girlsDresses)||(previousPath==='/forWomen'&&new URLSearchParams(previousCatalogue.split('?')[1]).get('category')==='dress'&&!sections.womenDresses)||(previousPath===routes.suits&&!sections.suits)||(previousPath===routes.familyLooks&&!sections.familyLooks)
    ? routes.newArrivals : previousCatalogue;
  useEffect(() => {
    setProductPrimaryCategory(
      product?.category === 'dress'
        ? product.gender === 'women' ? 'damskeSaty' : product.gender === 'girls' ? 'saty' : null
        : product?.category === 'suit'
          ? 'obleky'
          : null
    );
    return () => setProductPrimaryCategory(null);
  }, [product, setProductPrimaryCategory]);
  if (result.loading)
    return (
      <Page>
        <Copy role="status">Načítání produktu…</Copy>
      </Page>
    );
  if (result.error)
    return (
      <Page>
        <Title>
          {result.error instanceof PublicApiError && result.error.status === 404
            ? 'Produkt není dostupný'
            : 'Produkt se nepodařilo načíst'}
        </Title>
        <Actions>
          <Button onClick={result.reload}>Zkusit znovu</Button>
          <RouteLink to={catalogueReturnTo}>Zpět na produkty</RouteLink>
        </Actions>
      </Page>
    );
  if (!product) return null;
  const rentable = product.variants.some(
    v => v.pricing.studio || v.pricing.external
  );
  return (
    <Page>
      <Actions>
        <RouteLink
          to={catalogueReturnTo}
        >
          Zpět na produkty
        </RouteLink>
      </Actions>
      <Columns>
        <ProductGallery key={product.id} product={product} />
        <Stack>
          <Title>{product.name}</Title>
          <ProductShareActions key={product.slug} id={product.id} name={product.name} slug={product.slug} />
          <FavoritesFeedback />
          {product.color ? <Copy>Barva: {product.color}</Copy> : null}
          {product.description ? (
            <Copy style={{ whiteSpace: 'pre-wrap' }}>
              {product.description}
            </Copy>
          ) : null}
          <Heading>Velikosti a ceny pronájmu</Heading>
          {product.variants.length ? (
            product.variants.map(variant => (
              <Panel key={variant.id}>
                <Heading>Velikost {variant.size}</Heading>
                {(['studio', 'external'] as const).map(mode => (
                  <Stack key={mode}>
                    <strong>{modeLabel(mode)}</strong>
                    {variant.pricing[mode] ? (
                      <Facts>
                        <div>
                          <dt>{mode==='studio'?'Cena za focení':'První den'}</dt>
                          <dd>
                            {formatMoney(variant.pricing[mode]!.rentalPrice)}
                          </dd>
                        </div>
                        {mode === 'external' && <div><dt>Každý další den</dt><dd>{formatMoney(variant.pricing[mode]!.additionalDayPrice ?? 200)}</dd></div>}
                        {variant.pricing[mode]!.deposit>0 && (
                          <div>
                            <dt>Vratná kauce</dt>
                            <dd>{formatMoney(variant.pricing[mode]!.deposit)}</dd>
                          </div>
                        )}
                      </Facts>
                    ) : (
                      <Copy>Tento způsob pronájmu není dostupný.</Copy>
                    )}
                  </Stack>
                ))}
                <FittingPrice><div><dt>Zkouška</dt><dd>{formatMoney(200)}</dd></div></FittingPrice>
              </Panel>
            ))
          ) : (
            <Copy>Momentálně nejsou dostupné žádné velikosti.</Copy>
          )}
          <BookingSection>
            <Copy>Zkouška je placená. Po jejím absolvování můžete získat slevu 200 Kč na pronájem.</Copy>
            <ProductActions><RouteLink to={"/zkouska?product="+encodeURIComponent(product.id)}>Rezervovat zkoušku</RouteLink></ProductActions>
          </BookingSection>
          <RentalSection>
            <Copy><strong>Na focení:</strong> vyzvednutí a vrácení ve stejný den, pouze osobně.</Copy>
            <Copy><strong>Na libovolnou příležitost:</strong> 1–7 dní, s možností dopravy.</Copy>
            <Copy>Dostupnost a celkovou cenu uvidíte po výběru termínu.</Copy>
          {booking.error ? <Copy role="alert">{booking.error}</Copy> : null}
          {booking.stored?.kind === 'attempt' || booking.storageBlocked || booking.accountBlocked ? (
            <Alert>
              <Copy>
                {booking.accountBlocked ? 'Ověřujeme přihlášení…' :
                  booking.storageBlocked ? 'Uložení rezervace vyžaduje kontrolu. Otevřete rezervaci a zkuste obnovení.' :
                  'Nejprve ověřte výsledek předchozího odeslání rezervace.'}
              </Copy>
              <RouteLink to={routes.reservation} state={{ catalogueReturnTo }}>Otevřít rezervaci</RouteLink>
            </Alert>
          ) : booking.stored?.kind === 'receipt' ? (
            <Stack>
              <Copy>Předchozí rezervace {booking.stored.receipt.reservationNumber} již byla vytvořena.
                {' '}Stav: {statusLabel(booking.stored.receipt.status)}. Můžete vytvořit další rezervaci.</Copy>
              <ProductActions>
                <Button disabled={!rentable || booking.busy} onClick={() => {
                  if (booking.startNew() && booking.chooseProduct(product))
                    { trackProduct('begin_checkout', product.id); navigate(routes.reservation, { state: { catalogueReturnTo } }); }
                }}>Vytvořit novou rezervaci</Button>
                <RouteLink to={routes.reservation} state={{ catalogueReturnTo }}>Zobrazit předchozí rezervaci</RouteLink>
              </ProductActions>
            </Stack>
          ) : booking.draft && draftItems(booking.draft).some(item => item.product.id === product.id) ? (
            <ProductActions><ResumeReservationLink productId={product.id} catalogueReturnTo={catalogueReturnTo} /></ProductActions>
          ) : (
            <ProductActions>
              <Button
                disabled={!rentable || Boolean(booking.draft && draftItems(booking.draft).length >= 20)}
                onClick={() => {
                  if (booking.chooseProduct(product))
                    { trackProduct('begin_checkout', product.id); navigate(routes.reservation, { state: { catalogueReturnTo } }); }
                }}
              >
                {product.category === 'dress' ? 'Rezervovat šaty' : product.category === 'suit' ? 'Rezervovat oblek' : 'Rezervovat oblečení'}
              </Button>
            </ProductActions>
          )}
          </RentalSection>
        </Stack>
      </Columns>
    </Page>
  );
}
