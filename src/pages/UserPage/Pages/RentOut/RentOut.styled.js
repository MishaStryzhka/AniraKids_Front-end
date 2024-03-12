import styled from 'styled-components';

export const ListProducts = styled.ul`
  @media screen and (max-width: 427.5px) {
    gap: 15vw 4.7vw;
  }
  display: flex;
  flex-wrap: wrap;
  gap: 64px 20px;

  margin-top: 32px;
  @media screen and (min-width: 768px) {
    width: 630px;
    margin: 24px auto 0;
  }
  @media screen and (min-width: 1280px) {
    width: inherit;
  }
`;
