import styled from 'styled-components';

export const StyledButtonRemove = styled.button`
  color: ${({ theme }) => theme.color.mainColor1};
  background-color: ${({ theme }) => theme.color.mainColor3};

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
