import { Container } from 'components/Container/Container';
import GeneralTitle from 'components/PageTitle/PageTitle';
import MainContent from 'components/MainContent/MainContent';
import NavigationOverlay from 'components/NavigationOverlay/NavigationOverlay';
import SideBar from 'components/SideBar/SideBar';
import { useTitle } from 'hooks';
import WrapMainContent from 'components/WrapMainContent/WrapMainContent';
import FilterForPregnantWomen from 'components/Filters/FilterForPregnantWomen/FilterForPregnantWomen';
import FilterPrice from 'components/Filters/FilterPrice/FilterPrice';
import FilterSizeAdult from 'components/Filters/FilterSizeAdult/FilterSizeAdult';
import FilterColor from 'components/Filters/FilterColor/FilterColor';
import ProductCard from 'components/ProductCard/ProductCard';
import { useTranslation } from 'react-i18next';
import FilterSort from 'components/Filters/FilterSort/FilterSort';
import FilterType from 'components/Filters/FilterType/FilterType';
import { TitleFilter, Wrap } from './ForWomenPage.styled';
import FilterFamilyLookWomen from 'components/Filters/FilterFamilyLook/FilterFamilyLookWomen';
import IconsMenuForPages from 'components/IconsMenuForPages/IconsMenuForPages';
import Border from 'components/Border/Border';
import ProductPage from 'pages/ProductPage/ProductPage';
import { useParams } from 'react-router-dom';

const ForWomenPage = () => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'pages.forWomenPage',
  });
  useTitle(t("Women's Clothing"));
  const { id } = useParams();

  return id ? (
    <ProductPage />
  ) : (
    <Container>
      <NavigationOverlay />
      <GeneralTitle>{t("Women's Clothing")}</GeneralTitle>
      <Border />
      <WrapMainContent>
        <SideBar>
          <TitleFilter>{t('Filters')}</TitleFilter>
          <FilterType />
          <FilterForPregnantWomen />
          <FilterFamilyLookWomen />
          <FilterPrice />
          <FilterColor />
          <FilterSizeAdult />
        </SideBar>
        <MainContent>
          <Wrap>
            <IconsMenuForPages />
            <FilterSort />
          </Wrap>
          <ProductCard />
        </MainContent>
      </WrapMainContent>
    </Container>
  );
};

export default ForWomenPage;
