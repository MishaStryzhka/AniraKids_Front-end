import styled from 'styled-components';

export const StyledButtonRemove = styled.button`
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

  color: ${({ theme }) => theme.color.mainColor1};

  &:hover {
    background-color: ${({ theme }) => theme.color.additionalColorMain3};
    color: ${({ theme }) => theme.color.mainColor1};
  }

  &:active {
    background-color: ${({ theme }) => theme.color.mainColor3};
    color: ${({ theme }) => theme.color.mainColor5};
  }

  &[disabled] {
    background-color: ${({ theme }) => theme.color.additionalColorGray};
    color: ${({ theme }) => theme.color.mainColor5};
  }
`;
