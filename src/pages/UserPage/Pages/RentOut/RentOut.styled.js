import styled from 'styled-components';

export const ListProducts = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 64px;
  align-items: center;
  @media screen and (min-width: 768px) {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 64px 20px;
  }
`;
