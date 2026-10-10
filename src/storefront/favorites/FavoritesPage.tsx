import { Breadcrumbs } from '../../design-system/components/Breadcrumbs';
import { Button } from '../../design-system/components/Button';
import { productPath, routes } from '../../navigation/routes';
import { getCatalogue } from '../api/publicApi';
import { Grid, ProductImage } from '../CataloguePage';
import { Actions, Alert, Copy, Heading, Page, RouteLink, Title } from '../storefrontStyles';
import { usePublicRead } from '../usePublicRead';
import { FavoriteButton, FavoritesFeedback } from './FavoriteButton';
import { useFavorites } from './FavoritesProvider';
export function FavoritesPage() {
  const favorites = useFavorites();
  const ids = favorites.ids.join(',');
  const result = usePublicRead(ids || null, async signal => {
    const chunks: string[][] = [];
    for (let i = 0; i < favorites.ids.length; i += 24) chunks.push(favorites.ids.slice(i, i + 24));
    const pages = await Promise.all(chunks.map(chunk => getCatalogue({ ids: chunk.join(','), sort: 'name', page: 1, limit: 24 }, signal)));
    return { items: pages.flatMap(page => page.items) };
  });
  return <Page>
    <Breadcrumbs items={[{ label: 'Domů', to: routes.home }, { label: 'Oblíbené' }]} />
    <Title>Oblíbené</Title>
    <Copy>{favorites.signedIn ? 'Vaše oblíbené produkty jsou uložené v účtu.' : 'Váš výběr ukládáme v tomto prohlížeči. Po přihlášení jej přidáme do vašeho účtu.'}</Copy>
    <FavoritesFeedback />
    {favorites.loading || result.loading ? <Copy role="status">Načítání oblíbených…</Copy> : result.error ? <Alert role="alert"><Copy>Produkty se nepodařilo načíst.</Copy><Button onClick={result.reload}>Zkusit znovu</Button></Alert> : !favorites.error && !favorites.ids.length ? <><Heading>Zatím nemáte žádné oblíbené produkty</Heading><Copy>Uložte si šaty nebo oblek kliknutím na srdíčko.</Copy><RouteLink to={routes.newArrivals}>Prohlédnout nabídku</RouteLink></> : null}
    {!result.loading && result.data && <>
      {result.data.items.length < favorites.ids.length && <Copy>Některé uložené produkty nyní nejsou v nabídce. Můžete je odebrat srdíčkem.</Copy>}
      <Grid>{result.data.items.map(product => <li key={product.id}>
        <div style={{ position: 'relative' }}><span style={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}><FavoriteButton id={product.id} name={product.name} /></span><RouteLink to={productPath(product.slug)} state={{ catalogueReturnTo: routes.favourites }} aria-label={`Prohlédnout ${product.name}`} style={{ display: 'block', padding: 0 }}><ProductImage product={product} /></RouteLink></div>
        <Heading>{product.name}</Heading>{product.color && <Copy>{product.color}</Copy>}{product.rentalPriceFrom !== undefined && <Copy>Od {product.rentalPriceFrom.toLocaleString('cs-CZ')} Kč · ve studiu</Copy>}
      </li>)}</Grid>
      <Actions>{favorites.ids.filter(id => !result.data!.items.some(product => product.id === id)).map(id => <div key={id}><Copy>Produkt nyní není dostupný</Copy><FavoriteButton id={id} name="Nedostupný produkt" /></div>)}</Actions>
    </>}
  </Page>;
}
