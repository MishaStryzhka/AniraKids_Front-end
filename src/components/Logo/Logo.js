import { NavLink } from 'react-router-dom';
import IconLogo from '../../images/icons/IconLogo';

const Logo = () => {
  return (
    <NavLink to='./'>
      <IconLogo />
    </NavLink>
  );
};

export default Logo;
