import styled from 'styled-components';

export const ListProducts = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 64px;
  align-items: center;
  margin-top: 24px;

  @media screen and (min-width: 768px) {
    width: 630px;
    margin: 24px auto 0;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 64px 20px;
  }
  @media screen and (min-width: 1280px) {
    width: inherit;
    margin: 0;
  }
`;
