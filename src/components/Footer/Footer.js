import {
  FooterContainer,
  FooterCopyright,
  FooterNavigate,
  FooterWrap,
  StyledFooter,
} from './Footer.styled';
import Logo from 'components/Logo/Logo';
import SectionNavLinks from 'components/BoxNavLinks/BoxNavLinks';
import { useLocation } from 'react-router-dom';
import FooterSelectLanguage from 'components/FooterSelectLanguage/FooterSelectLanguage';

const Footer = () => {
  const { pathname } = useLocation();
  return (
    <StyledFooter $mainPage={pathname === `/`}>
      <FooterContainer>
        <FooterNavigate>
          <Logo />
          <SectionNavLinks />
        </FooterNavigate>
        <FooterWrap>
          <FooterCopyright>
            GlamGarb Rentals s.r.o © 2023 - 2024
          </FooterCopyright>
          <FooterSelectLanguage />
        </FooterWrap>
      </FooterContainer>
    </StyledFooter>
  );
};

export default Footer;
