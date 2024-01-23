import { Container } from 'components/Container/Container';
import GeneralTitle from 'components/PageTitle/PageTitle';
import NavigationOverlay from 'components/NavigationOverlay/NavigationOverlay';
import { useTranslation } from 'react-i18next';
import SideBar from 'components/SideBar/SideBar';
import { TitleFilter } from 'pages/ForWomenPage/ForWomenPage.styled';
import FilterType from 'components/Filters/FilterType/FilterType';
import FilterDecor from 'components/Filters/FilterDecor/FilterDecor';
import FilterPrice from 'components/Filters/FilterPrice/FilterPrice';
import FilterColor from 'components/Filters/FilterColor/FilterColor';
import MainContent from 'components/MainContent/MainContent';
import FilterSort from 'components/Filters/FilterSort/FilterSort';
import WrapMainContent from 'components/WrapMainContent/WrapMainContent';
import FilterOfToys from 'components/Filters/FilterToys/FilterToys';

const DecorAndToysPage = () => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'pages.decorAndToysPage',
  });
  return (
    <Container>
      <NavigationOverlay />
      <GeneralTitle>{t('Decor And Toys')}</GeneralTitle>
      <WrapMainContent>
        <SideBar>
          <TitleFilter>{t('Filters')}</TitleFilter>
          <FilterType />
          <FilterDecor />
          <FilterOfToys />
          <FilterPrice />
          <FilterColor />
        </SideBar>
        <MainContent>
          <FilterSort />
        </MainContent>
      </WrapMainContent>
    </Container>
  );
};

export default DecorAndToysPage;
