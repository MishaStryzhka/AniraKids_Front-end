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
  const {sections,cooperationActive}=useSiteSettings();
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
                {(['studio', 'external'] as const).filter(mode=>mode!=='studio'||cooperationActive).map(mode => (
                  <Stack key={mode}>
                    <strong>{mode === 'studio' ? 'Studio (Blaze)' : modeLabel(mode)}</strong>
                    {variant.pricing[mode] ? (
                      <Facts>
                        <div>
                          <dt>Cena pronájmu</dt>
                          <dd>
                            {formatMoney(variant.pricing[mode]!.rentalPrice)}
                          </dd>
                        </div>
                        {mode === 'external' && (
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
              </Panel>
            ))
          ) : (
            <Copy>Momentálně nejsou dostupné žádné velikosti.</Copy>
          )}
          <Actions><RouteLink to={"/zkouska?product="+encodeURIComponent(product.id)}>Rezervovat zkoušku</RouteLink></Actions>
          <Copy>
            Cena pronájmu je za rezervaci, nikoli za den. Dostupnost ověříme pro
            vybraný termín.
          </Copy>
          {booking.error ? <Copy role="alert">{booking.error}</Copy> : null}
          {booking.stored?.kind === 'attempt' || booking.storageBlocked || booking.accountBlocked ? (
            <Alert>
              <Copy>
                {booking.accountBlocked ? 'Pro zobrazení rezervace se přihlaste ke stejnému účtu.' :
                  booking.storageBlocked ? 'Uložení rezervace vyžaduje kontrolu. Otevřete rezervaci a zkuste obnovení.' :
                  'Nejprve ověřte výsledek předchozího odeslání rezervace.'}
              </Copy>
              <RouteLink to={routes.reservation} state={{ catalogueReturnTo }}>Otevřít rezervaci</RouteLink>
            </Alert>
          ) : booking.stored?.kind === 'receipt' ? (
            <Stack>
              <Copy>Předchozí rezervace {booking.stored.receipt.reservationNumber} již byla vytvořena.
                {' '}Stav: {statusLabel(booking.stored.receipt.status)}. Můžete vytvořit další rezervaci.</Copy>
              <Actions>
                <Button disabled={!rentable || booking.busy} onClick={() => {
                  if (booking.startNew() && booking.chooseProduct(product))
                    { trackProduct('begin_checkout', product.id); navigate(routes.reservation, { state: { catalogueReturnTo } }); }
                }}>Vytvořit novou rezervaci</Button>
                <RouteLink to={routes.reservation} state={{ catalogueReturnTo }}>Zobrazit předchozí rezervaci</RouteLink>
              </Actions>
            </Stack>
          ) : booking.draft && draftItems(booking.draft).some(item => item.product.id === product.id) ? (
            <Actions><ResumeReservationLink productId={product.id} catalogueReturnTo={catalogueReturnTo} /></Actions>
          ) : (
            <Actions>
              <Button
                disabled={!rentable || Boolean(booking.draft && draftItems(booking.draft).length >= 20)}
                onClick={() => {
                  if (booking.chooseProduct(product))
                    { trackProduct('begin_checkout', product.id); navigate(routes.reservation, { state: { catalogueReturnTo } }); }
                }}
              >
                Rezervovat
              </Button>
            </Actions>
          )}
        </Stack>
      </Columns>
    </Page>
  );
}
