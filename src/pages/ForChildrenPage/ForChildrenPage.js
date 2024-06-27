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
import UsersProductCard from 'components/UsersProductCard/UsersProductCard';
import SelectedFilters from 'components/Filters/SelectedFiltrs/SelectedFiltrs';
import SceletonUsersProductCard from 'components/UsersProductCard/SceletonUsersProductCard';

const api = require('../../api');

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
        category: 'forChildren',
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
      {!id && <GeneralTitle>{t("Children's Clothing")}</GeneralTitle>}
      <Border />
      {id ? (
        <Outlet />
      ) : (
        <WrapMainContent>
          <SideBar>
            <TitleFilter>{t('Filters')}</TitleFilter>
            <SelectedFilters />
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
            {products.length ? (
              <ProductList>
                {products?.map(product => (
                  <li key={product._id}>
                    <UsersProductCard
                      state={{
                        rentalPeriods: searchParams.get('rentalPeriods'),
                      }}
                      product={product}
                    />
                  </li>
                ))}
              </ProductList>
            ) : isLoading ? (
              <ProductList>
                {Array.from({ length: 9 }).map((_, index) => (
                  <li key={index}>
                    <SceletonUsersProductCard id={index} />
                  </li>
                ))}
              </ProductList>
            ) : (
              <NotFound>{t('nothing_found')}</NotFound>
            )}
          </MainContent>
        </WrapMainContent>
      )}
    </Container>
  );
};

export default ForChildrenPage;
