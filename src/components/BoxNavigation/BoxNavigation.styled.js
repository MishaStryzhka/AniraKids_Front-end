import styled from 'styled-components';

export const Box = styled.div`
  display: none;
  @media screen and (min-width: 1280px) {
    display: flex;
    gap: 16px;
  }
`;

export const Button = styled.button`
  background-color: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
`;
