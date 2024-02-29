import {
  FooterContainer,
  FooterCopyright,
  FooterNavigate,
  FooterWrap,
  StyledFooter,
  Wrap,
} from './Footer.styled';
import SectionNavLinks from 'components/BoxNavLinks/BoxNavLinks';
import { NavLink, useLocation } from 'react-router-dom';
import FooterSelectLanguage from 'components/FooterSelectLanguage/FooterSelectLanguage';
import IconInfo from 'images/icons/IconInfo';
import Logo from 'components/Logo/Logo';

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
          <NavLink
            style={{
              marginLeft: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              color: 'currentcolor',
            }}
            to={'/privacy-policy'}
          >
            <IconInfo width={18} height={18} color="#000" /> Ochrana osobních
            údajů
          </NavLink>
        </FooterWrap>
      </FooterContainer>
    </StyledFooter>
  );
};

export default Footer;
