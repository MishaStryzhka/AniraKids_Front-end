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
import FilterAge from 'components/Filters/FilterAge/FilterAge';
import FilterDecor from 'components/Filters/FilterDecor/FilterDecor';
import FilterColor from 'components/Filters/FilterColor/FilterColor';
import NotFound from 'components/NotFound/NotFound';

const ForMenPage = () => {
  const { t } = useTranslation();
  useTitle(t('Men suits'));
  return (
    <Container>
      <NavigationOverlay />
      <GeneralTitle>{t('Men suits')}</GeneralTitle>
      <WrapMainContent>
        <SideBar>
          <FilterPrice />
          <FilterSizeAdult />
          <FilterAge />
          <FilterDecor />
          <FilterColor />
        </SideBar>
        <MainContent>
          <NotFound>{t('Empty here for now')}</NotFound>
        </MainContent>
      </WrapMainContent>
    </Container>
  );
};

export default ForMenPage;
