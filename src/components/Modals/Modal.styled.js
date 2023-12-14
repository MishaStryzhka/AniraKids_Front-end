import styled from 'styled-components';

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
  // min-width: 280px;
  padding: 14px;
  margin: 0 auto;
  border-radius: 20px;
  z-index: 2000;
  @media screen and (min-width: 768px) {
    // min-width: 580px;
    /* height: 326px; */
  }
  @media screen and (min-width: 1440px) {
    // min-width: 920px;
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
