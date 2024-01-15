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
import FilterSizeChildren from 'components/Filters/FilterSizeChildren/FilterSizeChildren';
import FilterAge from 'components/Filters/FilterAge/FilterAge';
import FilterDecor from 'components/Filters/FilterDecor/FilterDecor';
import FilterColor from 'components/Filters/FilterColor/FilterColor';
import FilterOutfits from 'components/Filters/FilterOutfits/FilterOutfits';
import FilterSubject from 'components/Filters/FilterSubject/FilterSubject';
import ProductCard from 'components/ProductCard/ProductCard';
import { useTranslation } from 'react-i18next';

const ForWomenPage = () => {
  const { t } = useTranslation();
  useTitle(t("Women's Clothing"));

  return (
    <Container>
      <NavigationOverlay />
      <GeneralTitle>{t("Women's Clothing")}</GeneralTitle>
      <WrapMainContent>
        <SideBar>
          <FilterForPregnantWomen />
          <FilterFamilyLook />
          <FilterPrice />
          <FilterSizeAdult />
          <FilterSizeChildren />
          <FilterAge />
          <FilterDecor />
          <FilterColor />
          <FilterOutfits />
          <FilterSubject />
        </SideBar>
        <MainContent>
          <ProductCard />
        </MainContent>
      </WrapMainContent>
    </Container>
  );
};

export default ForWomenPage;
