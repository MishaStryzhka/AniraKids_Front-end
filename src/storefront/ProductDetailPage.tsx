import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../design-system/components/Button';
import { useStorefrontOutletContext } from '../layouts/StorefrontLayout';
import { routes } from '../navigation/routes';
import { getPublicProduct, PublicApiError } from './api/publicApi';
import { useBooking } from './booking/BookingProvider';
import { formatMoney, modeLabel } from './booking/bookingModel';
import { ProductImage } from './CataloguePage';
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
    booking = useBooking(),
    { setProductPrimaryCategory } = useStorefrontOutletContext();
  const result = usePublicRead(slug, signal => getPublicProduct(slug, signal));
  const [photo, setPhoto] = useState(0);
  useEffect(() => setPhoto(0), [slug]);
  const product = result.data;
  useEffect(() => {
    setProductPrimaryCategory(
      product?.category === 'dress'
        ? 'saty'
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
          <RouteLink to={routes.rental}>Zpět na produkty</RouteLink>
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
          to={
            product.category === 'dress'
              ? routes.dresses
              : product.category === 'suit'
                ? routes.suits
                : routes.rental
          }
        >
          Zpět na produkty
        </RouteLink>
      </Actions>
      <Columns>
        <Stack>
          <ProductImage
            product={{
              ...product,
              photos: product.photos.slice(photo, photo + 1),
            }}
          />
          {product.photos.length > 1 ? (
            <Actions aria-label="Fotografie produktu">
              {product.photos.map((p, index) => (
                <Button
                  key={index}
                  size="compact"
                  variant={photo === index ? 'primary' : 'secondary'}
                  aria-pressed={photo === index}
                  onClick={() => setPhoto(index)}
                >
                  Fotografie {index + 1}
                </Button>
              ))}
            </Actions>
          ) : null}
        </Stack>
        <Stack>
          <Title>{product.name}</Title>
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
                          <dt>Cena pronájmu</dt>
                          <dd>
                            {formatMoney(variant.pricing[mode]!.rentalPrice)}
                          </dd>
                        </div>
                        <div>
                          <dt>Vratná kauce</dt>
                          <dd>{formatMoney(variant.pricing[mode]!.deposit)}</dd>
                        </div>
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
          <Copy>
            Cena pronájmu je za rezervaci, nikoli za den. Dostupnost ověříme pro
            vybraný termín.
          </Copy>
          {booking.stored || booking.storageBlocked ? (
            <Alert>
              <Copy>
                Nejprve otevřete svou rozpracovanou rezervaci nebo její
                výsledek.
              </Copy>
              <RouteLink to={routes.reservation}>Otevřít rezervaci</RouteLink>
            </Alert>
          ) : (
            <Actions>
              <Button
                disabled={!rentable}
                onClick={() => {
                  if (booking.chooseProduct(product))
                    navigate(routes.reservation);
                }}
              >
                Vybrat velikost a termín
              </Button>
            </Actions>
          )}
        </Stack>
      </Columns>
    </Page>
  );
}
