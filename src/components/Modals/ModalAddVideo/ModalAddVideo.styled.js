import IconCross from 'images/icons/IconCross';
import IconSend from 'images/icons/IconSend';
import styled from 'styled-components';
import { ModalTitle } from '../Modal.styled';

export const StyledIconCross = styled(IconCross)`
  position: absolute;
  top: 30px;
  right: 30px;
  @media screen and (min-width: 768px) {
    top: 24px;
    right: 24px;
  }
`;

export const Title = styled(ModalTitle)`
  max-width: 200px;
  @media screen and (min-width: 768px) {
    max-width: 350px;
  }
`;

export const Label = styled.label`
  position: relative;
  width: 305px;
  @media screen and (min-width: 768px) {
    width: 400px;
  }
`;

export const Input = styled.input`
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.43;
  width: 273px;
  padding: 16px;
  border-radius: 5px;
  border: 2px solid #ebdad1;
  @media screen and (min-width: 768px) {
    width: 368px;
  }

  color: ${({ theme }) => theme.color.mainColor3};
  border-color: ${({ theme }) => theme.color.additionalColorBrown};
`;

export const StyledIconSend = styled(IconSend)`
  position: absolute;
  top: 14px;
  right: 16px;
`;
