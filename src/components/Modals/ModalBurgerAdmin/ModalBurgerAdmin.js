import BoxNavigation from 'components/BoxNavigation/BoxNavigation';
import {
  Button,
  ModalWindow,
  Wrap,
  WrapBoxNav,
  WrapNavLinks,
} from './ModalBurgerAdmin.styled';
import IconCross from 'images/icons/IconCross';
import { StyledButton, StyledNavLink } from 'pages/UserPage/UserPage.styled';
import IconPerson from 'images/icons/IconPerson';
import IconChat from 'images/icons/IconChat';
import IconHeart from 'images/icons/IconHeart';
import IconCloth from 'images/icons/IconCloth';
import IconHanger from 'images/icons/IconHanger';
import IconBag2 from 'images/icons/IconBag2';
import IconShopCart from 'images/icons/IconShopCart';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'hooks';
import IconCard from 'images/icons/IconCard';
import IconBag from 'images/icons/IconBag';
import { useDispatch } from 'react-redux';
import { logOut } from '../../../redux/auth/operations';
import IconExit from 'images/icons/IconExit';

const ModalBurgerAdmin = ({ onClick }) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'pages.userPage',
  });
  const dispatch = useDispatch();

  const { user } = useAuth();
  return (
    <ModalWindow>
      <Wrap>
        <WrapBoxNav>
          <BoxNavigation />
        </WrapBoxNav>
        <Button>
          <IconCross
            onClick={() =>
              // document.body.style.overflow = 'auto';
              onClick()
            }
          />
          <WrapNavLinks>
            <StyledNavLink to="./profile" onClick={() => onClick()}>
              <IconPerson />
              {t('profile')}
            </StyledNavLink>
            <StyledNavLink to="./chat" onClick={() => onClick()}>
              <IconChat /> {t('chat')}
            </StyledNavLink>
            <StyledNavLink to="./favorite" onClick={() => onClick()}>
              <IconHeart />
              {t('favorite')}
            </StyledNavLink>
            {user.typeUser === 'owner' && (
              <StyledNavLink to="./rent-out" onClick={() => onClick()}>
                <IconCloth /> {t('rentOut')}
              </StyledNavLink>
            )}
            <StyledNavLink to="./rent-in" onClick={() => onClick()}>
              <IconHanger />
              {t('rentIn')}
            </StyledNavLink>
            <StyledNavLink to="./my-orders" onClick={() => onClick()}>
              <IconBag2 />
              {t('myPurchases')}
            </StyledNavLink>
            {user.typeUser === 'owner' && (
              <StyledNavLink to="./my-purchases" onClick={() => onClick()}>
                <IconShopCart /> {t('mySales')}
              </StyledNavLink>
            )}
            <StyledNavLink to="./wallet" onClick={() => onClick()}>
              <IconCard /> {t('wallet')}
            </StyledNavLink>
            <StyledNavLink to="./order1" onClick={() => onClick()}>
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
          </WrapNavLinks>
        </Button>
      </Wrap>
    </ModalWindow>
  );
};

export default ModalBurgerAdmin;
