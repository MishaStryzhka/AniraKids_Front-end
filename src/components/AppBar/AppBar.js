import { useLocation } from 'react-router-dom';
import {
  BoxShadow,
  ContainerAppBar,
  FirstHeader,
  Item,
  List,
  SecondHeader,
} from './AppBar.styled';
import Logo from '../Logo/Logo';
import SearchInput from '../SearchInput/SearchInput';
import BoxNavigation from '../BoxNavigation/BoxNavigation';
import BoxNavLinks from '../BoxNavLinks/BoxNavLinks';
import { Container } from 'components/Container/Container';
import { useTranslation } from 'react-i18next';

const AppBar = () => {
  const { pathname } = useLocation();
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.appBar',
  });
  return (
    <>
      <BoxShadow $mainPage={pathname === `/`}>
        <Container>
          <ContainerAppBar $mainPage={pathname === `/`}>
            <FirstHeader>
              <List>
                <Item $mainPage={pathname === `/`}>{t('Women')}</Item>
                <Item $mainPage={pathname === `/`}>{t('Men')}</Item>
                <Item $mainPage={pathname === `/`}>{t('Children')}</Item>
              </List>
              <Logo />
              <SearchInput />
              <BoxNavigation $mainPage={pathname === `/`} />
            </FirstHeader>
            <SecondHeader>
              <BoxNavLinks $mainPage={pathname === `/`} />
            </SecondHeader>
          </ContainerAppBar>
        </Container>
      </BoxShadow>
    </>
  );
};

export default AppBar;
