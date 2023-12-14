import styled from 'styled-components';

export const Title = styled.h2`
  font-family: 'Cormorant SC';
  font-size: 48px;
  font-weight: 500;
  line-height: 1.17;
  text-align: center;

  color: ${({ theme }) => theme.color.mainColor5};
`;
