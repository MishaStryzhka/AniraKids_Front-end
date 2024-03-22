import styled from 'styled-components';

export const ButtonCalendar = styled.button`
  border: none;
  padding: 14px;
  cursor: pointer;

  background-color: transparent;
  @media screen and (min-width: 768px) {
  }
  @media screen and (min-width: 1280px) {
  }
`;

export const MenuCalendar = styled.div`
  padding: 24px;
  background-color: ${({ theme }) => theme.color.mainColor1};
  border-radius: 10px;
  box-shadow: ${({ theme }) => theme.boxShadow};
  border: 2px solid ${({ theme }) => theme.color.additionalColorBrown};

  width: 360px;
  box-sizing: border-box;
`;

export const MenuHeader = styled.div`
  position: relative;

  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
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

export const ListInfo = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;
export const ItemInfo = styled.li`
  display: flex;
  gap: 6px;
`;

export const MarkerDelivery = styled.div`
  width: 20px;
  height: 20px;
  background-color: rgb(170, 230, 123);
  border-radius: 20px;
`;
export const MarkerRent = styled.div`
  width: 20px;
  height: 20px;
  background-color: #ebdad1;
  border-radius: 20px;
`;
export const MarkerReturn = styled.div`
  width: 20px;
  height: 20px;
  background-color: red;
  border-radius: 20px;
`;

export const MenuDescription = styled.p`
  text-align: center;
`;
