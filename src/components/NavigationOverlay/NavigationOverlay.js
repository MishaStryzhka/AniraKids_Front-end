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
    </NavigationWrapper>
  );
};

export default NavigationOverlay;
