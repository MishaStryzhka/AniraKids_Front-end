import styled from 'styled-components';

export const MainTitle = styled.h1`
  @media screen and (max-width: 427.5px) {
    font-size: 8vw;
  }
  text-align: center;
  font-family: 'Cormorant SC';
  font-size: 32px;
  font-weight: 500;
  line-height: 1.25;
  margin-bottom: 16px;
  text-transform: uppercase;

  color: ${({ theme }) => theme.color.mainColor4};
`;

export const Title = styled.h2`
  @media screen and (max-width: 427.5px) {
    font-size: 4.7vw;
  }
  font-family: 'Cormorant SC';
  font-size: 20px;
  font-weight: 700;
  line-height: 1.4;
  text-transform: uppercase;
  margin-top: 10px;
  color: ${({ theme }) => theme.color.mainColor5};
`;

export const Text = styled.p`
  @media screen and (max-width: 427.5px) {
    font-size: 3.7vw;
  }
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 18px;
  font-weight: 400;
  line-height: 1.43;

  color: ${({ theme }) => theme.color.mainColor5};
`;

export const List = styled.ul`
  list-style-type: square;
  margin-left: 20px;
  margin-top: 6px;
`;

export const Item = styled.li`
  @media screen and (max-width: 427.5px) {
    font-size: 3.3vw;
  }
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 16px;
  font-weight: 400;
  line-height: 1.43;
  margin-bottom: 3px;

  color: ${({ theme }) => theme.color.mainColor5};
`;
