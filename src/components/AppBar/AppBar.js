import { useLocation } from 'react-router-dom';
import { ContainerAppBar, Item, List } from './AppBar.styled';
import Logo from '../Logo/Logo';
import SearchInput from '../SearchInput/SearchInput';
import BoxNavigation from '../BoxNavigation/BoxNavigation';
import SectionNavLinks from '../SectionNavLinks/SectionNavLinks';

const AppBar = () => {
  const { pathname } = useLocation();
  console.log('pathname', pathname);
  console.log('pathname === `/`', pathname === `/`);

  return (
    <ContainerAppBar $mainPage={pathname === `/`}>
      <List>
        <Item>Жінки</Item>
        <Item>Чоловіки</Item>
        <Item>Діти</Item>
      </List>
      <Logo />
      <SearchInput />
      <BoxNavigation />
      <SectionNavLinks />
    </ContainerAppBar>
  );
};

export default AppBar;
