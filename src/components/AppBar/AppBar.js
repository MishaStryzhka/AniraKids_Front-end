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

const AppBar = () => {
  const { pathname } = useLocation();
  // console.log('pathname', pathname);
  // console.log('pathname === `/`', pathname === `/`);

  return (
    <>
      <BoxShadow $mainPage={pathname === `/`}>
        <Container>
          <ContainerAppBar $mainPage={pathname === `/`}>
            <FirstHeader>
              <List>
                <Item $mainPage={pathname === `/`}>Жінки</Item>
                <Item $mainPage={pathname === `/`}>Чоловіки</Item>
                <Item $mainPage={pathname === `/`}>Діти</Item>
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
