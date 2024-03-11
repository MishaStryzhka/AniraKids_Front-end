import styled from 'styled-components';

export const WrapMenu = styled.div`
  /* display: flex;
  gap: 4px; */
`;

export const ButtonFilters = styled.button`
  @media screen and (max-width: 427.5px) {
    padding: 2vw;
  }
  border: none;
  padding: 14px;
  cursor: pointer;
  margin-right: 4px;

  background-color: transparent;
  @media screen and (min-width: 768px) {
  }
  @media screen and (min-width: 1280px) {
    display: none;
  }
`;
