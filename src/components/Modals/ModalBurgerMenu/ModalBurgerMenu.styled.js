import styled from 'styled-components';

export const ModalWindow = styled.div`
  box-sizing: border-box;
  width: 378px;
  display: flex;
  padding: 24px;
  gap: 24px;
  height: 652px;
  flex-direction: column;
  position: relative;

  background-color: ${({ theme }) => theme.color.mainColor1};
`;

export const Wrap = styled.div`
  display: flex;
  justify-content: space-between;
`;

export const Button = styled.button`
  width: 40px;
  height: 40px;
  border: none;
  padding: 8px;
  cursor: pointer;
  background-color: transparent;
`;

export const WrapBoxLink = styled.div`
  padding: 12px 0;
`;

export const WrapBoxNav = styled.div`
  margin: 0 auto;
`;
