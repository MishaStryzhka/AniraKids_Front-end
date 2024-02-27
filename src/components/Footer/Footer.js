import {
  FooterContainer,
  FooterCopyright,
  FooterNavigate,
  FooterWrap,
  StyledFooter,
  StyledIconLogo,
  Wrap,
} from './Footer.styled';
import SectionNavLinks from 'components/BoxNavLinks/BoxNavLinks';
import { NavLink, useLocation } from 'react-router-dom';
import FooterSelectLanguage from 'components/FooterSelectLanguage/FooterSelectLanguage';

const Footer = () => {
  const { pathname } = useLocation();
  return (
    <StyledFooter $mainPage={pathname === `/`}>
      <FooterContainer>
        <FooterNavigate>
          <NavLink to="./" style={{ display: 'flex' }}>
            <StyledIconLogo />
          </NavLink>
          <Wrap>
            <SectionNavLinks />
            <FooterSelectLanguage />
          </Wrap>
        </FooterNavigate>
        <FooterWrap>
          <FooterCopyright>
            AniraKids © 2023 - 2024 GlamGarb Rentals s.r.o
          </FooterCopyright>
        </FooterWrap>
      </FooterContainer>
    </StyledFooter>
  );
};

export default Footer;
