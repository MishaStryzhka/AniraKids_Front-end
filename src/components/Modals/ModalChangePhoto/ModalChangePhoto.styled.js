import IconCross from 'images/icons/IconCross';
import IconSend from 'images/icons/IconSend';
import styled from 'styled-components';

export const ModalWindow = styled.div`
  display: flex;
  padding: 24px;
  gap: 24px;
  flex-direction: column;
  align-items: center;
  position: relative;

  background-color: ${({ theme }) => theme.color.mainColor1};
`;

export const StyledIconCross = styled(IconCross)`
  position: absolute;
  top: 24px;
  right: 24px;
  cursor: pointer;
`;

export const ModalTitle = styled.h2`
  text-align: center;
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.4;
  letter-spacing: 0.02px;

  color: ${({ theme }) => theme.color.mainColor5};
`;

export const Picture = styled.picture`
  display: block;
  width: 200px;
  height: 200px;
`;

export const LabelModal = styled.label`
  position: relative;
`;

export const InputModal = styled.input`
  @media screen and (max-width: 427.5px) {
    width: 93.5vw;
  }
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.43;
  border-radius: 2px;
  border: 1px solid;
  padding: 16px;
  outline: none;
  width: 400px;

  border-color: ${({ theme }) => theme.color.mainColor2};
  color: ${({ theme }) => theme.color.mainColor3};
`;

export const StyledIconSend = styled(IconSend)`
  position: absolute;
  top: 16px;
  right: 16px;
`;
