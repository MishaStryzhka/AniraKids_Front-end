import styled from 'styled-components';

export const StyledButton = styled.button`
  @media screen and (max-width: 427.5) {
    padding: 3vw 9vw;
  }
  text-decoration: none;
  text-transform: uppercase;
  border: none;
  outline: none;

  border-radius: 2px;
  padding: 14px 40px;

  box-sizing: border-box;
  width: ${({ width }) => width || '305px'};
  height: ${({ height }) => height || '48px'};

  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;

  background-color: ${({ theme }) => theme.color.mainColor3};

  text-align: center;

  font-family: Open Sans, sans-serif;
  font-weight: 700;
  font-size: 14px;
  line-height: 143%;
  text-align: center;

  &:hover:not([disabled]) {
    box-shadow: ${({ theme }) => theme.boxShadow};
  }

  &[disabled] {
    cursor: default;
  }
`;
