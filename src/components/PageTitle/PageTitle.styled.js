import styled from 'styled-components';

export const Title = styled.h2`
  @media screen and (max-width: 427.5px) {
    font-size: 7.5vw;
  }
  text-transform: uppercase;

  margin-top: 24px;
  font-family: 'Cormorant SC';
  font-size: 32px;
  font-weight: 500;
  line-height: 1.25;
  text-align: center;
  margin-bottom: 16px;

  color: ${({ theme }) => theme.color.mainColor5};

  @media screen and (min-width: 1280px) {
    font-size: 48px;
    line-height: 1.17;
  }
`;
