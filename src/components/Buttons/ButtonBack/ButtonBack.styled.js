import styled from 'styled-components';
import { StyledButton } from '../Button.styled';

export const StyledButtonBack = styled(StyledButton)`
  @media screen and (max-width: 427.5px) {
    width: 71vw;
  }
  color: ${({ theme }) => theme.color.mainColor1};
  background-color: ${({ theme }) => theme.color.mainColor3};

  &:hover {
    background-color: ${({ theme }) => theme.color.mainColor2};
    color: ${({ theme }) => theme.color.mainColor5};
  }

  &:active {
    background-color: ${({ theme }) => theme.color.additionalColorMain3};
    color: ${({ theme }) => theme.color.mainColor5};
  }

  &[disabled] {
    background-color: ${({ theme }) => theme.color.additionalColorGray};
    color: ${({ theme }) => theme.color.mainColor5};
  }
`;
