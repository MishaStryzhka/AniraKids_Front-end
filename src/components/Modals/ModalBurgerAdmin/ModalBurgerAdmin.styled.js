import styled from 'styled-components';

export const ModalWindow = styled.div`
  width: 340px;
  height: 552px;
  display: flex;
  padding: 24px;
  gap: 24px;
  border-radius: 8px;
  flex-direction: column;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 3;

  box-shadow: 0px 6px 8px 2px rgba(17, 17, 17, 0.2);
  background-color: ${({ theme }) => theme.color.mainColor1};
`;

export const Wrap = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
`;

export const Button = styled.button`
  width: 40px;
  height: 40px;
  border: none;
  padding: 8px;
  cursor: pointer;
  background-color: transparent;
`;

export const WrapNavLinks = styled.div`
  display: block;
  width: 305px;
  position: absolute;
  top: 100px;
  left: 24px;
`;

export const WrapBoxNav = styled.div`
  margin: 0 auto;
`;