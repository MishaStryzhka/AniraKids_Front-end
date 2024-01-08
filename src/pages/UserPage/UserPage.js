import { Container } from 'components/Container/Container';
import MainContent from 'components/MainContent/MainContent';
import NavigationOverlay from 'components/NavigationOverlay/NavigationOverlay';
import SideBar from 'components/SideBar/SideBar';
import WrapMainContent from 'components/WrapMainContent/WrapMainContent';
import { useTitle } from 'hooks';
import { useDispatch } from 'react-redux';
import { Outlet } from 'react-router-dom';
import { logOut } from '../../redux/auth/operations';
import { StyledButton, StyledNavLink } from './UserPage.styled';
import IconPerson from 'images/icons/IconPerson';
import IconChat from 'images/icons/IconChat';
import IconHeart from 'images/icons/IconHeart';
import IconCloth from 'images/icons/IconCloth';
import IconHanger from 'images/icons/IconHanger';
import IconBag2 from 'images/icons/IconBag2';
import IconShopCart from 'images/icons/IconShopCart';
import IconCard from 'images/icons/IconCard';
import IconBag from 'images/icons/IconBag';
import IconExit from 'images/icons/IconExit';

const UserPage = () => {
  const dispatch = useDispatch();

  useTitle('Акаунт');

  return (
    <Container>
      <NavigationOverlay />
      <WrapMainContent>
        <SideBar>
          <StyledNavLink to="./profile">
            <IconPerson /> Профіль
          </StyledNavLink>
          <StyledNavLink to="./chat">
            <IconChat /> Чат
          </StyledNavLink>
          <StyledNavLink to="./favorite">
            <IconHeart />
            Улюблене
          </StyledNavLink>
          <StyledNavLink to="./rent-out">
            <IconCloth /> Пропоную
          </StyledNavLink>
          <StyledNavLink to="./rent-in">
            <IconHanger />
            Орендую
          </StyledNavLink>
          <StyledNavLink to="./my-orders">
            <IconBag2 />
            Мої покупки
          </StyledNavLink>
          <StyledNavLink to="./my-purchases">
            <IconShopCart /> Мої продажі
          </StyledNavLink>
          <StyledNavLink to="./wallet">
            <IconCard /> Мій гаманець
          </StyledNavLink>
          <StyledNavLink to="./order1">
            <IconBag /> Кошик
          </StyledNavLink>
          <StyledButton
            type="button"
            title="LogOut"
            onClick={() => dispatch(logOut())}
          >
            <IconExit />
            Вийти
          </StyledButton>
        </SideBar>
        <MainContent>
          <Outlet />
        </MainContent>
      </WrapMainContent>
    </Container>
  );
};

export default UserPage;
