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
import { useTranslation } from 'react-i18next';

const UserPage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  useTitle('Акаунт');

  return (
    <Container>
      <NavigationOverlay />
      <WrapMainContent>
        <SideBar>
          <StyledNavLink to="./profile">
            <IconPerson />
            {t('profile')}
          </StyledNavLink>
          <StyledNavLink to="./chat">
            <IconChat /> {t('chat')}
          </StyledNavLink>
          <StyledNavLink to="./favorite">
            <IconHeart />
            {t('favorite')}
          </StyledNavLink>
          <StyledNavLink to="./rent-out">
            <IconCloth /> {t('rentOut')}
          </StyledNavLink>
          <StyledNavLink to="./rent-in">
            <IconHanger />
            {t('rentIn')}
          </StyledNavLink>
          <StyledNavLink to="./my-orders">
            <IconBag2 />
            {t('myPurchases')}
          </StyledNavLink>
          <StyledNavLink to="./my-purchases">
            <IconShopCart /> {t('mySales')}
          </StyledNavLink>
          <StyledNavLink to="./wallet">
            <IconCard /> {t('wallet')}
          </StyledNavLink>
          <StyledNavLink to="./order1">
            <IconBag /> {t('basket')}
          </StyledNavLink>
          <StyledButton
            type="button"
            title={t('logOut')}
            onClick={() => dispatch(logOut())}
          >
            <IconExit />
            {t('logOut')}
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
