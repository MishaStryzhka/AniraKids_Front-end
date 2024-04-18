import { useLocation, useParams } from 'react-router-dom';
import {
  MenuButton,
  NavigationWrapper,
  StyledNavLink,
} from './NavigationOverlay.styled';
import IconArrow from 'images/icons/IconArrow';
import { useTranslation } from 'react-i18next';
import IconBurgerMenu from 'images/icons/IconBurgerMenu';
import { useState } from 'react';
import ModalBurgerAdmin from 'components/Modals/ModalBurgerAdmin/ModalBurgerAdmin';

const NavigationOverlay = () => {
  const location = useLocation();
  const { t } = useTranslation();

  const { id: productId } = useParams();

  const [isModal, setIsModal] = useState(false);
  const closeModal = () => {
    setIsModal(false);
  };
  const openModal = () => {
    setIsModal(true);
  };

  return (
    <NavigationWrapper>
      {/* =====Головна======= */}

      {location.pathname.includes('/forWomen') && (
        <>
          <StyledNavLink to="/">{t('home')}</StyledNavLink>
          <IconArrow />
          <StyledNavLink
            $notActive={location.pathname !== '/forWomen'}
            to="/forWomen"
          >
            {t('womenClothing')}
          </StyledNavLink>
          {productId && (
            <>
              <IconArrow />
              <StyledNavLink to={`/forWomen/${productId}`}>
                {t('cardProduct')}
              </StyledNavLink>
            </>
          )}
        </>
      )}
      {location.pathname.includes('/forMen') && (
        <>
          <StyledNavLink to="/">{t('home')}</StyledNavLink>
          <IconArrow />
          <StyledNavLink
            $notActive={location.pathname !== '/forMen'}
            to="/forMen"
          >
            {t('menSuits')}
          </StyledNavLink>
          {productId && (
            <>
              <IconArrow />
              <StyledNavLink to={`/forMen/${productId}`}>
                {t('cardProduct')}
              </StyledNavLink>
            </>
          )}
        </>
      )}
      {location.pathname.includes('/forChildren') && (
        <>
          <StyledNavLink to="/">{t('home')}</StyledNavLink>
          <IconArrow />
          <StyledNavLink
            $notActive={location.pathname !== '/forChildren'}
            to="/forChildren"
          >
            {t('childrenClothing')}
          </StyledNavLink>
          {productId && (
            <>
              <IconArrow />
              <StyledNavLink to={`/forChildren/${productId}`}>
                {t('cardProduct')}
              </StyledNavLink>
            </>
          )}
        </>
      )}
      {location.pathname.includes('/decorAndToys') && (
        <>
          <StyledNavLink to="/">{t('home')}</StyledNavLink>
          <IconArrow />
          <StyledNavLink
            $notActive={location.pathname !== '/decorAndToys'}
            to="/decorAndToys"
          >
            {t('decorAndToys')}
          </StyledNavLink>
          {productId && (
            <>
              <IconArrow />
              <StyledNavLink to={`/decorAndToys/${productId}`}>
                {t('cardProduct')}
              </StyledNavLink>
            </>
          )}
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
            <>
              <StyledNavLink
                $notActive={location.pathname !== '/my-account/favorite'}
                to="./favorite"
              >
                {t('favorite')}
              </StyledNavLink>
              {productId && (
                <>
                  <IconArrow />
                  <StyledNavLink to={`/my-account/favorite/${productId}`}>
                    {t('cardProduct')}
                  </StyledNavLink>
                </>
              )}
            </>
          )}
          {location.pathname.includes('rent-out') && (
            <>
              <StyledNavLink
                $notActive={location.pathname !== '/my-account/rent-out'}
                to="./rent-out"
              >
                {t('offer')}
              </StyledNavLink>
              {location.pathname !== '/my-account/rent-out' && <IconArrow />}
              {location.pathname.includes('add-product') && (
                <StyledNavLink to="/my-account/rent-out/add-product">
                  {t('addProduct')}
                </StyledNavLink>
              )}
              {location.pathname.includes('update-product') && (
                <StyledNavLink
                  to={`/my-account/rent-out/update-product/${productId}`}
                >
                  {t('edit')}
                </StyledNavLink>
              )}
            </>
          )}
          {location.pathname.includes('rent-in') && (
            <StyledNavLink to="./rent-in">{t('rentIn')}</StyledNavLink>
          )}
          {location.pathname.includes('my-orders') && (
            <StyledNavLink to="./my-orders">{t('myOrders')}</StyledNavLink>
          )}
          {location.pathname.includes('my-purchases') && (
            <StyledNavLink to="./my-purchases">
              {t('myPurchases')}
            </StyledNavLink>
          )}
          {location.pathname.includes('cart') && (
            <StyledNavLink to="./cart">{t('basket')}</StyledNavLink>
          )}
        </>
      )}
    </NavigationWrapper>
  );
};

export default NavigationOverlay;
