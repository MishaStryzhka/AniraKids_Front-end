import styled from 'styled-components';

export const Title = styled.h2`
  @media screen and (max-width: 427.5px) {
    font-size: 4.7vw;
  }
  font-family: 'Cormorant SC';
  font-size: 20px;
  font-weight: 700;
  line-height: 1.4;
  text-transform: uppercase;
  margin-top: 40px;
  margin-left: 30px;
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

  margin-top: 10px;
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
