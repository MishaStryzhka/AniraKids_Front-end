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
import { TitleFilter } from 'pages/ForWomenPage/ForWomenPage.styled';
import FilterSubject from 'components/Filters/FilterSubject/FilterSubject';
import FilterSizeChildren from 'components/Filters/FilterSizeChildren/FilterSizeChildren';
import FilterOutfits from 'components/Filters/FilterOutfits/FilterOutfits';
import FilterType from 'components/Filters/FilterType/FilterType';
import FilterSort from 'components/Filters/FilterSort/FilterSort';

const ForChildrenPage = () => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'pages.forChildrenPage',
  });
  useTitle(t("Children's Clothing"));

  return (
    <Container>
      <NavigationOverlay />
      <GeneralTitle>{t("Children's Clothing")}</GeneralTitle>
      <WrapMainContent>
        <SideBar>
          <TitleFilter>{t('Filters')}</TitleFilter>
          <FilterType />
          <FilterSubject />
          <FilterOutfits />
          <FilterAge />
          <FilterPrice />
          <FilterColor />
          <FilterSizeChildren />
        </SideBar>
        <MainContent>
          <FilterSort />
          <NotFound>{t('Empty here for now')}</NotFound>
        </MainContent>
      </WrapMainContent>
    </Container>
  );
};

export default ForChildrenPage;
