import { useLocation } from 'react-router-dom';
import { StyledIconLogo, StyledNavLink } from './Logo.styled.js';

const Logo = ({ $isHeader }) => {
  const { pathname } = useLocation();

  return (
    <StyledNavLink $isHeader={$isHeader} to="./">
      <StyledIconLogo fill={pathname === '/' ? '#fff' : '#000'} />
    </StyledNavLink>
  );
};

export default Logo;
