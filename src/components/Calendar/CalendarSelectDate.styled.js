import styled from 'styled-components';

export const WrapCalendar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const MenuTitle = styled.h2`
  font-weight: 700;
  font-size: 20px;
  line-height: 140%;
  letter-spacing: 0em;
  text-align: center;
  color: ${({ theme }) => theme.color.mainColor5};
`;

export const MenuButtonClose = styled.button`
  width: 40px;
  height: 40px;

  border: none;
  background-color: transparent;

  position: absolute;
  top: 6px;
  right: 0;

  display: flex;
  align-items: center;
  justify-content: center;
`;

export const MenuDescription = styled.p`
  text-align: center;
`;
