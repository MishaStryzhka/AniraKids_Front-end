import { Container } from 'components/Container/Container';
import GeneralTitle from 'components/PageTitle/PageTitle';
import NavigationOverlay from 'components/NavigationOverlay/NavigationOverlay';
import { useTitle } from 'hooks';
import { useTranslation } from 'react-i18next';
import WrapMainContent from 'components/WrapMainContent/WrapMainContent';
import SideBar from 'components/SideBar/SideBar';
import MainContent from 'components/MainContent/MainContent';
import FilterPrice from 'components/Filters/FilterPrice/FilterPrice';
import FilterSizeAdult from 'components/Filters/FilterSizeAdult/FilterSizeAdult';
import FilterColor from 'components/Filters/FilterColor/FilterColor';
import NotFound from 'components/NotFound/NotFound';
import { TitleFilter } from './ForMenPage.styled';
import FilterType from 'components/Filters/FilterType/FilterType';
import FilterSort from 'components/Filters/FilterSort/FilterSort';
import FilterFamilyLookMen from 'components/Filters/FilterFamilyLook/FilterFamilyLookMen';
import { Wrap } from 'pages/ForWomenPage/ForWomenPage.styled';
import IconsMenuForPages from 'components/IconsMenuForPages/IconsMenuForPages';
import Border from 'components/Border/Border';
import { Outlet, useParams, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ProductList } from 'pages/pages.styled';
import UsersProductCard from 'components/UsersProductCard/UsersProductCard';
// import SelectedFilters from 'components/Filters/SelectedFiltrs/SelectedFiltrs';

const api = require('../../api');

const ForMenPage = () => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'pages.forMenPage',
  });
  useTitle(t('Men suits'));
  const { id } = useParams();

  // eslint-disable-next-line no-unused-vars
  const [page, setPage] = useState(1);
  // eslint-disable-next-line no-unused-vars
  const [pageSize, setPageSize] = useState(9);

  const [products, setProducts] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [totalProducts, setTotalProducts] = useState();

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
        category: 'men`s category',
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

  return (
    <Container>
      <NavigationOverlay />
      {!id && <GeneralTitle>{t('Men suits')}</GeneralTitle>}
      <Border />
      {id ? (
        <Outlet />
      ) : (
        <WrapMainContent>
          <SideBar>
            <TitleFilter>{t('Filters')}</TitleFilter>
            {/* <SelectedFilters /> */}
            <FilterType />
            <FilterFamilyLookMen />
            <FilterPrice />
            <FilterColor />
            <FilterSizeAdult />
          </SideBar>
          <MainContent>
            <Wrap>
              <IconsMenuForPages />
              <FilterSort />
            </Wrap>
            {products.length ? (
              <ProductList>
                {products?.map(product => (
                  <li key={product._id}>
                    <UsersProductCard product={product} />
                  </li>
                ))}
              </ProductList>
            ) : isLoading ? (
              <p>Loading...</p>
            ) : (
              <NotFound>{t('nothing_found')}</NotFound>
            )}
          </MainContent>
        </WrapMainContent>
      )}
    </Container>
  );
};

export default ForMenPage;
