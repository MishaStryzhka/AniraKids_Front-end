import { Container } from 'components/Container/Container';
import GeneralTitle from 'components/PageTitle/PageTitle';
import NavigationOverlay from 'components/NavigationOverlay/NavigationOverlay';
import { useTranslation } from 'react-i18next';
import { useTitle } from 'hooks';
import WrapMainContent from 'components/WrapMainContent/WrapMainContent';
import SideBar from 'components/SideBar/SideBar';
import FilterPrice from 'components/Filters/FilterPrice/FilterPrice';
import FilterSizeAdult from 'components/Filters/FilterSizeAdult/FilterSizeAdult';
import FilterAge from 'components/Filters/FilterAge/FilterAge';
import FilterDecor from 'components/Filters/FilterDecor/FilterDecor';
import FilterColor from 'components/Filters/FilterColor/FilterColor';
import MainContent from 'components/MainContent/MainContent';
import NotFound from 'components/NotFound/NotFound';

const ForChildrenPage = () => {
  const { t } = useTranslation();
  useTitle(t("Children's Clothing"));

  return (
    <Container>
      <NavigationOverlay />
      <GeneralTitle>{t("Children's Clothing")}</GeneralTitle>
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

export default ForChildrenPage;
