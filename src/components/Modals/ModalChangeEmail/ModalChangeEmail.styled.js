import IconCross from 'images/icons/IconCross';
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
  font-family: Open Sans, sans-serif;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.4;
  letter-spacing: 0.02px;

  color: ${({ theme }) => theme.color.mainColor5};
`;

export const LabelModal = styled.label`
  width: 400px;
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.43;
  display: flex;
  flex-direction: column;

  color: ${({ theme }) => theme.color.mainColor5};
`;

export const InputModal = styled.input`
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.43;
  border-radius: 2px;
  border: 1px solid;
  padding: 8px;
  outline: none;

  border-color: ${({ theme }) => theme.color.mainColor2};
  color: ${({ theme }) => theme.color.lightBGColor};
`;

export const WrapButton = styled.div`
  display: flex;
  justify-content: center;
`;
