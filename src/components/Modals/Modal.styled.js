import styled from 'styled-components';

export const TextDone = styled.p`
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
  background-color: ${p => p.theme.color.cardBG};
  margin: auto;
  border-radius: 20px;
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

export const ModalTitle = styled.h2`
  text-align: center;
  font-family: Open Sans, sans-serif;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.4;
  letter-spacing: 0.02px;

  color: ${({ theme }) => theme.color.mainColor5};
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
  box-sizing: border-box;
  ${({ width }) => `width: ${width};`}
  display: flex;
  padding: 24px;
  gap: 24px;
  flex-direction: column;
  align-items: center;
  position: relative;

  background-color: ${({ theme }) => theme.color.mainColor1};
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

export const ScrollBox = styled.div`
  overflow: auto;

  box-sizing: border-box;
  height: 100vh;
  width: 100vw;

  display: flex;

  padding: 40px;
`;
