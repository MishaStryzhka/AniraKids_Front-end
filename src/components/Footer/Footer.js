import {
  FooterContainer,
  FooterCopyright,
  FooterNavigate,
  FooterWrap,
  StyledFooter,
  StyledNavLink,
  Wrap,
} from './Footer.styled';
import SectionNavLinks from 'components/BoxNavLinks/BoxNavLinks';
import FooterSelectLanguage from 'components/FooterSelectLanguage/FooterSelectLanguage';
import IconInfo from 'images/icons/IconInfo';
import Logo from 'components/Logo/Logo';
import { useLocation } from 'react-router';

const Footer = () => {
  const { pathname } = useLocation();
  return (
    <StyledFooter $mainPage={pathname === `/`}>
      <FooterContainer>
        <FooterNavigate>
          <Logo />
          <Wrap>
            <SectionNavLinks />
            <FooterSelectLanguage />
          </Wrap>
        </FooterNavigate>
        <FooterWrap>
          <FooterCopyright>
            AniraKids © 2023 - 2024 GlamGarb Rentals s.r.o
          </FooterCopyright>
          <StyledNavLink to={'/privacy-policy'}>
            <IconInfo width={18} height={18} color="#000" /> Ochrana osobních
            údajů
          </StyledNavLink>
        </FooterWrap>
      </FooterContainer>
    </StyledFooter>
  );
};

export default Footer;
