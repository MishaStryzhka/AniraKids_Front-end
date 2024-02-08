import { useLocation } from 'react-router-dom';
import {
  MenuButton,
  NavigationWrapper,
  SecondBox,
  StyledNavLink,
  StyledSecondButton,
  TabBar,
} from './NavigationOverlay.styled';
import IconArrow from 'images/icons/IconArrow';
import IconPlus from 'images/icons/IconPlus';
import { useTranslation } from 'react-i18next';
import IconBurgerMenu from 'images/icons/IconBurgerMenu';
import { useState } from 'react';
import ModalBurgerAdmin from 'components/Modals/ModalBurgerAdmin/ModalBurgerAdmin';

const NavigationOverlay = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const [isModal, setIsModal] = useState(false);
  const closeModal = () => {
    setIsModal(false);
  };
  const openModal = () => {
    setIsModal(true);
  };
  return (
    <TabBar>
      <NavigationWrapper>
        {/* =====Головна======= */}

        {location.pathname === '/forWomen' && (
          <>
            <StyledNavLink to="/">{t('home')}</StyledNavLink>
            <IconArrow />
            <StyledNavLink to="/forWomen">{t('womenClothing')}</StyledNavLink>
            {location.pathname.includes('productCard') && (
              <StyledNavLink to="./productCard">
                {t('cardProduct')}
              </StyledNavLink>
            )}
          </>
        )}
        {location.pathname === '/forMen' && (
          <>
            <StyledNavLink to="/">{t('home')}</StyledNavLink>
            <IconArrow />
            <StyledNavLink to="/forMen">{t('menSuits')}</StyledNavLink>
          </>
        )}
        {location.pathname === '/forChildren' && (
          <>
            <StyledNavLink to="/">{t('home')}</StyledNavLink>
            <IconArrow />
            <StyledNavLink to="/forChildren">
              {t('childrenClothing')}
            </StyledNavLink>
          </>
        )}
        {location.pathname === '/decorAndToys' && (
          <>
            <StyledNavLink to="/">{t('home')}</StyledNavLink>
            <IconArrow />
            <StyledNavLink to="/decorAndToys">
              {t('decorAndToys')}
            </StyledNavLink>
          </>
        )}
        {location.pathname === '/aboutUs' && (
          <>
            <StyledNavLink to="/">{t('home')}</StyledNavLink>
            <IconArrow />
            <StyledNavLink to="/aboutUs">{t('aboutUs')}</StyledNavLink>
          </>
        )}
        {/* ======Акаунт======= */}
        {location.pathname.includes('my-account') && (
          <>
            <MenuButton type="button" onClick={openModal}>
              <IconBurgerMenu />
            </MenuButton>
            {isModal && <ModalBurgerAdmin onClick={closeModal} />}
            <StyledNavLink $notActive to="/my-account/profile">
              {t('account')}
            </StyledNavLink>
            <IconArrow />
            {location.pathname.includes('profile') && (
              <StyledNavLink to="./profile">{t('profile')}</StyledNavLink>
            )}
            {location.pathname.includes('chat') && (
              <StyledNavLink to="./chat">{t('chat')}</StyledNavLink>
            )}
            {location.pathname.includes('favorite') && (
              <StyledNavLink to="./favorite">{t('favorite')}</StyledNavLink>
            )}
            {location.pathname.includes('rent-out') && (
              <StyledNavLink to="./rent-out">{t('offer')}</StyledNavLink>
            )}
            {location.pathname.includes('rent-in') && (
              <StyledNavLink to="./rent-in">{t('rentIn')}</StyledNavLink>
            )}
            {location.pathname.includes('my-orders') && (
              <StyledNavLink to="./my-orders">{t('myOrders')}</StyledNavLink>
            )}
          </>
        )}
      </NavigationWrapper>
      <SecondBox>
        {location.pathname === '/my-account/rent-out' && (
          <StyledSecondButton to="/my-account/rent-out/add-product">
            {t('addProduct')} <IconPlus />
          </StyledSecondButton>
        )}
      </SecondBox>
    </TabBar>
  );
};

export default NavigationOverlay;
