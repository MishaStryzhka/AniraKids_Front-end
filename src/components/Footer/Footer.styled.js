import { Container } from 'components/Container/Container';
import styled from 'styled-components';

export const StyledFooter = styled.footer`
  /* width: 100%; */

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
  @media screen and (min-width: 1280px) {
    display: flex;
    flex-direction: column;
    gap: 8px;
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

export const FooterCopyright = styled.p``;

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
  }
  @media screen and (min-width: 1280px) {
    flex-direction: row;
    gap: 32px;
    align-items: center;
  }
`;