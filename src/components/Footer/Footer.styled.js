import { Container } from 'components/Container/Container';
import IconLogo from 'images/icons/Icon';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

export const StyledFooter = styled.footer`
  /* width: 428px;
  margin: 0 auto; */
  padding: 40px;
  background-color: ${({ theme }) => theme.color.lightBGColor};
  @media screen and (min-width: 1280px) {
    padding: 40px 0;
    margin: 0 auto;
    width: ${({ $mainPage }) => ($mainPage ? '1440px' : '100%')};
  }
`;

export const FooterContainer = styled(Container)`
  padding: 0;
  width: inherit;
  /* margin: 0 auto; */
  @media screen and (min-width: 1280px) {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
`;
export const StyledIconLogo = styled(IconLogo)`
  width: 40px;
  height: 40px;
  @media screen and (min-width: 768px) {
    width: 80px;
    height: 80px;
  }
`;

export const FooterNavigate = styled.div`
  display: flex;
  gap: 41px;
  @media screen and (min-width: 768px) {
    gap: 100px;
    justify-content: center;
  }
  @media screen and (min-width: 1280px) {
    align-items: center;
    gap: 32px;
  }
`;

export const FooterWrap = styled.div`
  display: flex;
  justify-content: center;
`;

export const FooterCopyright = styled.p`
  @media screen and (max-width: 427.5px) {
    font-size: 3.3vw;
  }
  font-size: 14px;
  width: 200px;
  @media screen and (min-width: 768px) {
    width: 350px;
  }
`;

export const Wrap = styled.div`
  display: flex;
  flex-direction: column-reverse;

  align-items: flex-start;
  gap: 16px;
  margin-bottom: 16px;
  @media screen and (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    gap: 80px;
    margin-bottom: 0;
  }
  @media screen and (min-width: 1280px) {
    flex-direction: row;
    gap: 32px;
    align-items: center;
  }
`;
export const StyledNavLink = styled(NavLink)`
  @media screen and (max-width: 427.5px) {
    font-size: 3.3vw;
  }
  font-size: 14px;
  margin-left: 20;
  display: flex;
  align-items: center;
  gap: 6px;
  text-decoration: none;
  color: ${({ theme }) => theme.color.mainColor5};
`;
