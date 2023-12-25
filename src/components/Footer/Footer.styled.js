import styled from 'styled-components';

export const WrapFooter = styled.footer`
  width: ${({ $mainPage }) => ($mainPage ? '1440px' : '100%')};
  margin: 0 auto;
  padding: 40px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 32px;

  background-color: ${({ theme }) => theme.color.lightBGColor};
`;
