import styled from 'styled-components';
import { StyledButton } from '../Button.styled';

export const StyledButtonUpdate = styled(StyledButton)`
  border: 1px solid ${({ theme }) => theme.color.additionalColorMain3};
  color: ${({ theme }) => theme.color.mainColor4};
  background-color: ${({ theme }) => theme.color.mainColor1};

  &:hover {
    color: ${({ theme }) => theme.color.additionalColorMain3};
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
