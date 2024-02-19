import { Container } from 'components/Container/Container';
import GeneralTitle from 'components/PageTitle/PageTitle';
import NavigationOverlay from 'components/NavigationOverlay/NavigationOverlay';
import { useTranslation } from 'react-i18next';
import { useTitle } from 'hooks';
import WrapMainContent from 'components/WrapMainContent/WrapMainContent';
import SideBar from 'components/SideBar/SideBar';
import FilterPrice from 'components/Filters/FilterPrice/FilterPrice';
import FilterAge from 'components/Filters/FilterAge/FilterAge';
import FilterColor from 'components/Filters/FilterColor/FilterColor';
import MainContent from 'components/MainContent/MainContent';
import NotFound from 'components/NotFound/NotFound';
import { TitleFilter, Wrap } from 'pages/ForWomenPage/ForWomenPage.styled';
import FilterSizeChildren from 'components/Filters/FilterSizeChildren/FilterSizeChildren';
import FilterOutfits from 'components/Filters/FilterOutfits/FilterOutfits';
import FilterType from 'components/Filters/FilterType/FilterType';
import FilterSort from 'components/Filters/FilterSort/FilterSort';
import IconsMenuForPages from 'components/IconsMenuForPages/IconsMenuForPages';
import Border from 'components/Border/Border';
import { Outlet, useParams, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ProductList } from 'pages/pages.styled';
import ProductCard from 'components/ProductCard/ProductCard';

const api = require('./../../api/product');

const ForChildrenPage = () => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'pages.forChildrenPage',
  });
  useTitle(t("Children's Clothing"));
  const { id } = useParams();

  // eslint-disable-next-line no-unused-vars
  const [page, setPage] = useState(1);
  // eslint-disable-next-line no-unused-vars
  const [pageSize, setPageSize] = useState(9);

  const [products, setProducts] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [totalProducts, setTotalProducts] = useState();
  console.log('products', products);

  const [isLoading, setIsLoading] = useState(true);
  // eslint-disable-next-line no-unused-vars
  const [error, setError] = useState();

  // eslint-disable-next-line no-unused-vars
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    setIsLoading(true);

    api
      .getProducts({
        page,
        pageSize,
        category: 'children`s category',
        ...Object.fromEntries(searchParams.entries()),
      })
      .then(data => {
        setProducts(data.products);
        setTotalProducts(data.totalProducts);
        setIsLoading(false);
      })
      .catch(error => {
        setError(error);
        setIsLoading(false);
      });
  }, [page, pageSize, searchParams]);

  return id ? (
    <Outlet />
  ) : (
    <Container>
      <NavigationOverlay />
      <GeneralTitle>{t("Children's Clothing")}</GeneralTitle>
      <Border />
      <WrapMainContent>
        <SideBar>
          <TitleFilter>{t('Filters')}</TitleFilter>
          <FilterType />
          <FilterOutfits />
          <FilterAge />
          <FilterPrice />
          <FilterColor />
          <FilterSizeChildren />
        </SideBar>
        <MainContent>
          <Wrap>
            <IconsMenuForPages />
            <FilterSort />
          </Wrap>
          {isLoading ? (
            <p>Loading...</p>
          ) : products.length ? (
            <ProductList>
              {products?.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </ProductList>
          ) : (
            <NotFound>{t('nothing_found')}</NotFound>
          )}
        </MainContent>
      </WrapMainContent>
    </Container>
  );
};

export default ForChildrenPage;
