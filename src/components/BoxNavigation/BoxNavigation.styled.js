import styled from 'styled-components';

export const Box = styled.div`
  display: flex;
  gap: 16px;
`;

export const Button = styled.button`
  display: flex;
  align-items: center;

  background-color: transparent;
  border: none;
  cursor: pointer;
  padding: 0;

  position: relative;
`;

export const Caunt = styled.p`
  position: absolute;
  top: -3px;
  right: -3px;

  width: 14px;
  height: 14px;
  border-radius: 50%;

  background-color: ${({ theme }) => theme.color.additionalColorBrown};

  font-weight: 700;
  font-size: 8px;
  line-height: 150%;
  letter-spacing: 0em;
  text-align: center;
  color: ${({ theme }) => theme.color.mainColor5};

  text-align: center;
  align-content: center;
`;
