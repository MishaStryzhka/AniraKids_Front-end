import styled from 'styled-components';

export const WrapFooter = styled.footer`
  width: 1440px;
  margin: 0 auto;
  padding: 40px 0;
  display: flex;
  align-items: center;
  justify-content: center;

  background-color: ${({ theme }) => theme.color.lightBGColor};
`;

export const Wrap = styled.div`
  display: flex;
  gap: 48px;
  align-items: center;
`;
