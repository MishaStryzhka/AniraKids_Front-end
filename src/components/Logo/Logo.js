import { NavLink } from 'react-router-dom';
import IconLogo from '../../images/icons/IconLogo';
// import { StyledIconLogo } from './Logo.styled';

const Logo = () => {
  return (
    <NavLink to="./" style={{ display: 'flex' }}>
      <IconLogo />
    </NavLink>
  );
};

export default Logo;
