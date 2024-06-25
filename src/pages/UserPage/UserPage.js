import { Container } from 'components/Container/Container';
import MainContent from 'components/MainContent/MainContent';
import NavigationOverlay from 'components/NavigationOverlay/NavigationOverlay';
import SideBar from 'components/SideBar/SideBar';
import WrapMainContent from 'components/WrapMainContent/WrapMainContent';
import { useAuth, useTitle } from 'hooks';
import { useDispatch } from 'react-redux';
import { Outlet, useLocation } from 'react-router-dom';
import { logOut } from '../../redux/auth/operations';
import {
  HeaderBox,
  SecondBox,
  // SecondBox,
  StyledButton,
  StyledIconBag,
  StyledNavLink,
} from './UserPage.styled';
import IconPerson from 'images/icons/IconPerson';
import IconHeart from 'images/icons/IconHeart';
import IconCloth from 'images/icons/IconCloth';
import IconHanger from 'images/icons/IconHanger';
import IconBag2 from 'images/icons/IconBag2';
import IconShopCart from 'images/icons/IconShopCart';
import IconExit from 'images/icons/IconExit';
import { useTranslation } from 'react-i18next';
import IconPlus from 'images/icons/IconPlus';
import ButtonAdd from 'components/Buttons/ButtonAdd/ButtonAdd';
// import { useState } from 'react';
export const sceletonArrayMenuLinks = Array.from({ length: 10 });
const UserPage = () => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'pages.userPage',
  });
  const dispatch = useDispatch();
  const location = useLocation();
  //  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useTitle('Акаунт');

  return (
    <Container>
      <HeaderBox>
        <NavigationOverlay />
        <SecondBox>
          {location.pathname === '/my-account/rent-out' && (
            <ButtonAdd to="/my-account/rent-out/add-product">
              {t('addProduct')} <IconPlus />
            </ButtonAdd>
          )}
        </SecondBox>
      </HeaderBox>

      <WrapMainContent>
        <SideBar>
          <div>
            <StyledNavLink to="./profile">
              <IconPerson />
              {t('profile')}
            </StyledNavLink>
            {/* <StyledNavLink to="./chat">
              <IconChat /> {t('chat')}
            </StyledNavLink> */}
            <StyledNavLink to="./favorite">
              <IconHeart />
              {t('favorite')}
            </StyledNavLink>
            {user?.typeUser === 'owner' && (
              <StyledNavLink to="./rent-out">
                <IconCloth /> {t('rentOut')}
              </StyledNavLink>
            )}
            <StyledNavLink to="./rent-in">
              <IconHanger />
              {t('rentIn')}
            </StyledNavLink>
            <StyledNavLink to="./my-orders">
              <IconBag2 />
              {t('myPurchases')}
            </StyledNavLink>
            {user?.typeUser === 'owner' && (
              <StyledNavLink to="./my-purchases">
                <IconShopCart /> {t('mySales')}
              </StyledNavLink>
            )}
            {/* <StyledNavLink to="./wallet">
              <IconCard /> {t('wallet')}
            </StyledNavLink> */}
            <StyledNavLink to="./cart">
              <StyledIconBag /> {t('basket')}
            </StyledNavLink>
            <StyledButton
              type="button"
              title={t('logOut')}
              onClick={() => dispatch(logOut())}
            >
              <IconExit />
              {t('logOut')}
            </StyledButton>
          </div>
        </SideBar>
        <MainContent>
          <Outlet />
        </MainContent>
      </WrapMainContent>
    </Container>
  );
};

export default UserPage;
