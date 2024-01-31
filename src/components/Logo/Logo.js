import { NavLink } from 'react-router-dom';
import IconLogo from '../../images/icons/IconLogo';
import IconLogoMin from 'images/icons/IconLogoMin';

const Logo = () => {
  const WidthScreen = window.innerWidth >= 1280;
  return (
    <NavLink to="./" style={{ display: 'flex' }}>
      {WidthScreen ? <IconLogo /> : <IconLogoMin />}
    </NavLink>
  );
};

export default Logo;
