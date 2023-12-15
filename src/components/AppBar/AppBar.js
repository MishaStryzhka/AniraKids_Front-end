import { useLocation } from 'react-router-dom';
import {
  BorderShadow,
  ContainerAppBar,
  Item,
  List,
  Wrap,
} from './AppBar.styled';
import Logo from '../Logo/Logo';
import SearchInput from '../SearchInput/SearchInput';
import BoxNavigation from '../BoxNavigation/BoxNavigation';
import SectionNavLinks from '../SectionNavLinks/SectionNavLinks';
import { Container } from 'components/Container/Container';

const AppBar = () => {
  const { pathname } = useLocation();
  console.log('pathname', pathname);
  console.log('pathname === `/`', pathname === `/`);

  return (
    <>
      <Container>
        <ContainerAppBar $mainPage={pathname === `/`}>
          <List>
            <Item $mainPage={pathname === `/`}>Жінки</Item>
            <Item $mainPage={pathname === `/`}>Чоловіки</Item>
            <Item $mainPage={pathname === `/`}>Діти</Item>
          </List>
          <Logo />
          <SearchInput />
          <BoxNavigation $mainPage={pathname === `/`} />
          <Wrap>
            <SectionNavLinks $mainPage={pathname === `/`} />
          </Wrap>
        </ContainerAppBar>
      </Container>
      <BorderShadow $mainPage={pathname === `/`} />
    </>
  );
};

export default AppBar;
