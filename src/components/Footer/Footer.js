import { WrapFooter } from './Footer.styled';
import Logo from 'components/Logo/Logo';
import SectionNavLinks from 'components/BoxNavLinks/BoxNavLinks';
import { useLocation } from 'react-router-dom';

const Footer = () => {
  const { pathname } = useLocation();
  return (
    <WrapFooter $mainPage={pathname === `/`}>
      <Logo />
      <SectionNavLinks />
    </WrapFooter>
  );
};

export default Footer;
