import { Container } from 'components/Container/Container';
import styled from 'styled-components';

export const StyledFooter = styled.footer`
  width: ${({ $mainPage }) => ($mainPage ? '1440px' : '100%')};
  margin: 0 auto;
  padding: 40px 0;

  background-color: ${({ theme }) => theme.color.lightBGColor};
`;

export const FooterContainer = styled(Container)`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const FooterNavigate = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 32px;
`;

export const FooterWrap = styled.div`
  display: flex;
  justify-content: space-between;
`;

export const FooterCopyright = styled.p``;
