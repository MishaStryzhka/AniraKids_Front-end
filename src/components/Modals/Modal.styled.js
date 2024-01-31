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
  /* min-width: 280px; */
  margin: 0 auto;
  border-radius: 20px;
  z-index: 2000;
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

export const ModalWindow = styled.div`
  display: flex;
  padding: 24px;
  gap: 24px;
  flex-direction: column;
  align-items: center;
  position: relative;

  background-color: ${({ theme }) => theme.color.mainColor1};
`;
