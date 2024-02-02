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

const ForMenPage = () => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'pages.forMenPage',
  });
  useTitle(t('Men suits'));
  return (
    <Container>
      <NavigationOverlay />
      <GeneralTitle>{t('Men suits')}</GeneralTitle>
      <Border />
      <WrapMainContent>
        <SideBar>
          <TitleFilter>{t('Filters')}</TitleFilter>
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
          <NotFound>{t('Empty here for now')}</NotFound>
        </MainContent>
      </WrapMainContent>
    </Container>
  );
};

export default ForMenPage;
