import { NavLink } from 'react-router-dom';
import { StyledIconLogo } from './Logo.styled';

const Logo = () => {
  return (
    <NavLink to="./" style={{ display: 'flex' }}>
      <StyledIconLogo />
    </NavLink>
  );
};

export default Logo;
