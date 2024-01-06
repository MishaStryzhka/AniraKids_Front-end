import { useLocation } from 'react-router-dom';
import { NavigationWrapper, StyledNavLink } from './NavigationOverlay.styled';
import IconArrow from 'images/icons/IconArrow';

const NavigationOverlay = () => {
  const location = useLocation();

  return (
    <NavigationWrapper>
      {/* =====Головна======= */}

      {location.pathname === '/forWomen' && (
        <>
          <StyledNavLink to="/">Головна</StyledNavLink>
          <IconArrow />
          <StyledNavLink to="/forWomen">Жіночі наряди</StyledNavLink>
        </>
      )}
      {location.pathname === '/forMen' && (
        <>
          <StyledNavLink to="/">Головна</StyledNavLink>
          <IconArrow />
          <StyledNavLink to="/forMen">Чоловічі костюми</StyledNavLink>
        </>
      )}
      {location.pathname === '/forChildren' && (
        <>
          <StyledNavLink to="/">Головна</StyledNavLink>
          <IconArrow />
          <StyledNavLink to="/forChildren">Дитячі наряди</StyledNavLink>
        </>
      )}
      {location.pathname === '/decorAndToys' && (
        <>
          <StyledNavLink to="/">Головна</StyledNavLink>
          <IconArrow />
          <StyledNavLink to="/decorAndToys">Декор та іграшки</StyledNavLink>
        </>
      )}
      {location.pathname === '/aboutUs' && (
        <>
          <StyledNavLink to="/">Головна</StyledNavLink>
          <IconArrow />
          <StyledNavLink to="/aboutUs">Про нас</StyledNavLink>
        </>
      )}

      {/* ======Акаунт======= */}
      {location.pathname.includes('my-account') && (
        <>
          <StyledNavLink $notActive to="/my-account/profile">
            Акаунт
          </StyledNavLink>
          <IconArrow />
          {location.pathname.includes('profile') && (
            <StyledNavLink to="./profile">Профіль</StyledNavLink>
          )}
          {location.pathname.includes('chat') && (
            <StyledNavLink to="./chat">Чат</StyledNavLink>
          )}
          {location.pathname.includes('favorite') && (
            <StyledNavLink to="./favorite">Улюблене</StyledNavLink>
          )}
          {location.pathname.includes('rent-out') && (
            <StyledNavLink to="./rent-out">Пропоную</StyledNavLink>
          )}
          {location.pathname.includes('rent-in') && (
            <StyledNavLink to="./rent-in">Орендую</StyledNavLink>
          )}
          {location.pathname.includes('my-orders') && (
            <StyledNavLink to="./my-orders">Мої покупки</StyledNavLink>
          )}
          {location.pathname.includes('my-purchases') && (
            <StyledNavLink to="./my-purchases">Мої продажі</StyledNavLink>
          )}
          {location.pathname.includes('wallet') && (
            <StyledNavLink to="./wallet">Мій гаманець</StyledNavLink>
          )}
          {location.pathname.includes('order1') && (
            <StyledNavLink to="./order1">Кошик</StyledNavLink>
          )}
        </>
      )}
    </NavigationWrapper>
  );
};

export default NavigationOverlay;
