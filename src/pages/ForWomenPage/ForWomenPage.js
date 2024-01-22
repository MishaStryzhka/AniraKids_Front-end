import { Container } from 'components/Container/Container';
import GeneralTitle from 'components/PageTitle/PageTitle';
import MainContent from 'components/MainContent/MainContent';
import NavigationOverlay from 'components/NavigationOverlay/NavigationOverlay';
import SideBar from 'components/SideBar/SideBar';
import { useTitle } from 'hooks';
import WrapMainContent from 'components/WrapMainContent/WrapMainContent';
import FilterForPregnantWomen from 'components/Filters/FilterForPregnantWomen/FilterForPregnantWomen';
import FilterFamilyLook from 'components/Filters/FilterFamilyLook/FilterFamilyLook';
import FilterPrice from 'components/Filters/FilterPrice/FilterPrice';
import FilterSizeAdult from 'components/Filters/FilterSizeAdult/FilterSizeAdult';
import FilterColor from 'components/Filters/FilterColor/FilterColor';
import ProductCard from 'components/ProductCard/ProductCard';
import { useTranslation } from 'react-i18next';
import FilterSort from 'components/Filters/FilterSort/FilterSort';
import FilterType from 'components/Filters/FilterType/FilterType';
import { TitleFilter } from './ForWomenPage.styled';

const ForWomenPage = () => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'pages.forWomenPage',
  });
  useTitle(t("Women's Clothing"));

  return (
    <Container>
      <NavigationOverlay />
      <GeneralTitle>{t("Women's Clothing")}</GeneralTitle>
      <WrapMainContent>
        <SideBar>
          <TitleFilter>{t('Filters')}</TitleFilter>
          <FilterType />
          <FilterForPregnantWomen />
          <FilterFamilyLook />
          <FilterPrice />
          <FilterColor />
          <FilterSizeAdult />
        </SideBar>
        <MainContent>
          <FilterSort />
          <ProductCard />
        </MainContent>
      </WrapMainContent>
    </Container>
  );
};

export default ForWomenPage;
