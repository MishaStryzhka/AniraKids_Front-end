import { Container } from 'components/Container/Container';
import GeneralTitle from 'components/PageTitle/PageTitle';
import NavigationOverlay from 'components/NavigationOverlay/NavigationOverlay';
import { useTranslation } from 'react-i18next';
import SideBar from 'components/SideBar/SideBar';
import { TitleFilter, Wrap } from 'pages/ForWomenPage/ForWomenPage.styled';
import FilterType from 'components/Filters/FilterType/FilterType';
import FilterDecor from 'components/Filters/FilterDecor/FilterDecor';
import FilterPrice from 'components/Filters/FilterPrice/FilterPrice';
import FilterColor from 'components/Filters/FilterColor/FilterColor';
import MainContent from 'components/MainContent/MainContent';
import FilterSort from 'components/Filters/FilterSort/FilterSort';
import WrapMainContent from 'components/WrapMainContent/WrapMainContent';
import FilterOfToys from 'components/Filters/FilterToys/FilterToys';
import NotFound from 'components/NotFound/NotFound';
import IconsMenuForPages from 'components/IconsMenuForPages/IconsMenuForPages';
import Border from 'components/Border/Border';
import { Outlet, useParams, useSearchParams } from 'react-router-dom';
import { useTitle } from 'hooks';
import FilterSubject from 'components/Filters/FilterSubject/FilterSubject';
import { useEffect, useState } from 'react';
import { ProductList } from 'pages/pages.styled';
import UsersProductCard from 'components/UsersProductCard/UsersProductCard';

const api = require('../../api/product');

const DecorAndToysPage = () => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'pages.decorAndToysPage',
  });
  useTitle(t('Decor And Toys'));
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
        category: 'decoration category',
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
      {!id && <GeneralTitle>{t('Decor And Toys')}</GeneralTitle>}
      <Border />
      {id ? (
        <Outlet />
      ) : (
        <WrapMainContent>
          <SideBar>
            <TitleFilter>{t('Filters')}</TitleFilter>
            <FilterType />
            <FilterDecor />
            <FilterSubject />
            <FilterOfToys />
            <FilterPrice />
            <FilterColor />
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

export default DecorAndToysPage;
