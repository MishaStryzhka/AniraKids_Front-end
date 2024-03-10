import styled from 'styled-components';

export const StyleButton = styled.button`
  @media screen and (max-width: 427.5px) {
    width: 71vw;
    padding: 3.3vw 9.3vw;
  }
  padding: 14px 40px;
  width: 304px;
  border: none;
  border-radius: 2px;
  cursor: pointer;

  text-align: center;

  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 14px;
  font-style: normal;
  font-weight: 700;
  line-height: 1.43;
  text-transform: uppercase;

  color: ${({ theme }) => theme.color.mainColor1};
  background-color: ${({ theme }) => theme.color.btnColorBG};

  transition: all 250ms cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    background-color: ${({ theme }) => theme.color.mainColor3};
  }

  &:active {
    background-color: ${({ theme }) => theme.color.mainColor3};
    color: ${({ theme }) => theme.color.mainColor5};
  }
`;
