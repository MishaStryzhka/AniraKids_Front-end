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
import FilterFamilyLook from 'components/Filters/FilterFamilyLook/FilterFamilyLook';

const ForMenPage = () => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'pages.forMenPage',
  });
  useTitle(t('Men suits'));
  return (
    <Container>
      <NavigationOverlay />
      <GeneralTitle>{t('Men suits')}</GeneralTitle>
      <WrapMainContent>
        <SideBar>
          <TitleFilter>{t('Filters')}</TitleFilter>
          <FilterType />
          <FilterFamilyLook />
          <FilterPrice />
          <FilterColor />
          <FilterSizeAdult />
        </SideBar>
        <MainContent>
          <FilterSort />
          <NotFound>{t('Empty here for now')}</NotFound>
        </MainContent>
      </WrapMainContent>
    </Container>
  );
};

export default ForMenPage;
