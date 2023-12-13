import { Wrap, WrapFooter } from './Footer.styled';
import Logo from 'components/Logo/Logo';
import SectionNavLinks from 'components/SectionNavLinks/SectionNavLinks';

const Footer = () => {
  return (
    <WrapFooter>
      <Wrap>
        <Logo />
        <SectionNavLinks />
      </Wrap>
    </WrapFooter>
  );
};

export default Footer;
