import { useLocation } from 'react-router-dom';
import {
  NavigationWrapper,
  SecondBox,
  StyledNavLink,
  StyledSecondButton,
  TabBar,
} from './NavigationOverlay.styled';
import IconArrow from 'images/icons/IconArrow';
import IconPlus from 'images/icons/IconPlus';
import { useTranslation } from 'react-i18next';

const NavigationOverlay = () => {
  const location = useLocation();
  const { t } = useTranslation();

  return (
    <TabBar>
      <NavigationWrapper>
        {/* =====Головна======= */}

        {location.pathname === '/forWomen' && (
          <>
            <StyledNavLink to="/">{t('home')}</StyledNavLink>
            <IconArrow />
            <StyledNavLink to="/forWomen">{t('womenClothing')}</StyledNavLink>
          </>
        )}
        {location.pathname === '/forMen' && (
          <>
            <StyledNavLink to="/">{t('home')}</StyledNavLink>
            <IconArrow />
            <StyledNavLink to="/forMen">{t('menSuits')}</StyledNavLink>
          </>
        )}
        {/* Тут інші розділи із використанням t('ключ') */}

        {/* ======Акаунт======= */}
        {location.pathname.includes('my-account') && (
          <>
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
            {/* Тут інші розділи для акаунта */}
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
