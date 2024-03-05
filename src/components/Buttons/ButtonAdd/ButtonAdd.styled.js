import styled from 'styled-components';
import { StyledButton } from '../Button.styled';

export const StyledButtonAdd = styled(StyledButton)`
  border: 1px solid ${({ theme }) => theme.color.additionalColorMain3};
  background-color: ${({ theme }) => theme.color.mainColor1};
  color: ${({ theme }) => theme.color.mainColor4};

  &:hover {
    background-color: ${({ theme }) => theme.color.mainColor1};
    color: ${({ theme }) => theme.color.additionalColorMain3};
  }

  &:active {
    background-color: ${({ theme }) => theme.color.additionalColorMain3};
    color: ${({ theme }) => theme.color.mainColor4};
  }

  &[disabled] {
    background-color: ${({ theme }) => theme.color.additionalColorGray};
    color: ${({ theme }) => theme.color.mainColor4};
  }
`;
