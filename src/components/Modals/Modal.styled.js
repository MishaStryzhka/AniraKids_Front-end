import IconCross from 'images/icons/IconCross';
import styled from 'styled-components';

export const GeneralModalWindow = styled.div`
  position: relative;
  padding: 16px;

  @media screen and (min-width: 768px) {
    padding: 24px;
  }
  background-color: ${({ theme }) => theme.color.mainColor1};
`;

export const StyledIconCross = styled(IconCross)`
  position: absolute;
  top: 8px;
  right: 8px;
  cursor: pointer;
  stroke: ${({ theme }) => theme.color.mainColor3};
  fill: ${({ theme }) => theme.color.mainColor3};
  z-index: 1;
`;

export const StyledIconCrossToWindow = styled(IconCross)`
  position: absolute;
  top: 16px;
  right: 16px;
  cursor: pointer;
  @media screen and (min-width: 768px) {
    top: 24px;
    right: 24px;
  }
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

export const TextDescription = styled.p`
  @media screen and (max-width: 427.5px) {
    max-width: 46.7vw;
  }
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 14px;
  margin-top: 0;
  text-align: center;
  font-weight: 700;
  line-height: 1.43;
  max-width: 200px;

  color: ${({ theme }) => theme.color.mainColor5};
`;

export const TextDone = styled.p`
  @media screen and (max-width: 427.5px) {
    padding: 11.2vw;
  }
  padding: 48px 48px;

  text-align: center;
  font-family: Open Sans, sans-serif;
  font-size: 24px;
  font-weight: 400;
  line-height: 1.4;
  letter-spacing: 0.02px;

  color: ${({ theme }) => theme.color.mainColor5};
`;

export const Backdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(97, 97, 97, 0.6);
  backdrop-filter: blur(4px);
  z-index: 1200;
`;
export const ModalContainer = styled.div`
  position: relative;
  background-color: ${({ theme }) => theme.color.mainColor1};
  margin: auto;
  border-radius: 2px;
  z-index: 2000;
  height: max-content;

  @media screen and (min-width: 768px) {
    // min-width: 580px;
    /* height: 326px; */
  }
  @media screen and (min-width: 1440px) {
    max-width: 920px;
    /* height: 326px; */
  }
`;
export const BtnStyled = styled.button`
  cursor: pointer;
  border: none;
  margin-left: auto;
  padding: 0;

  background-color: transparent;
`;

export const ModalDescription = styled.p`
  text-align: center;
  font-family: Open Sans, sans-serif;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.4;
  letter-spacing: 0.02px;

  color: ${({ theme }) => theme.color.mainColor5};
`;

export const ModalWindow = styled.div`
  @media screen and (max-width: 427.5px) {
    width: 84vw;
    padding: 3.7vw;
  }
  box-sizing: border-box;
  /* ${({ width }) => `width: ${width};`} */
  width: 360px;
  display: flex;
  padding: 16px;
  gap: 16px;
  flex-direction: column;
  align-items: center;
  position: relative;
  @media screen and (min-width: 768px) {
    padding: 24px;
    gap: 24px;
    width: 448px;
  }

  background-color: ${({ theme }) => theme.color.mainColor1};
`;

export const LabelModal = styled.label`
  @media screen and (max-width: 427.5px) {
    width: 93.5vw;
  }
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
  color: ${({ theme }) => theme.color.mainColor2};
  &::placeholder {
    color: ${({ theme }) => theme.color.lightBGColor};
  }
`;

export const ScrollBox = styled.div`
  overflow: auto;

  box-sizing: border-box;
  height: 100vh;
  width: 100vw;

  display: flex;
`;

export const ErrorMessage = styled.p`
  color: ${({ theme }) => theme.color.additionalColorRed};

  font-family: 'Open Sans, sans-serif';
  font-size: 14px;
  font-style: normal;
  font-weight: 700;
  line-height: 20px; /* 142.857% */
`;

export const CloseButton = styled.button`
  padding: 0;
  cursor: pointer;
  background-color: transparent;
  border: none;
  position: absolute;
  top: 8px;
  right: 8px;
`;
