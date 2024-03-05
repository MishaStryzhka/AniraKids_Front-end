import styled from 'styled-components';

export const StyledButtonViewMore = styled.button`
  width: 287px;
  padding: 8px;
  margin-left: 0;

  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 20px;
  font-weight: 400;
  line-height: 1.4;
  text-transform: uppercase;
  text-decoration: none;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  border: none;
  background-color: transparent;

  @media screen and (min-width: 1280px) {
    float: right;
  }

  color: ${({ theme }) => theme.color.mainColor5};
`;
