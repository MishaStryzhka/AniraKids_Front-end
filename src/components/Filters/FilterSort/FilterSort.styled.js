import IconArrow from 'images/icons/IconArrow';
import styled from 'styled-components';

export const MainItem = styled.li`
  width: 305px;
  list-style: none;
  display: flex;
  flex-direction: column;
  position: relative;
  gap: 4px;
  margin-left: auto;
  margin-bottom: 24px;
`;

export const Wrap = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 12px;
  border-bottom: ${({ $openOutfitsList }) =>
    $openOutfitsList ? 'none' : '1px solid'};
  border-color: ${({ theme }) => theme.color.lightBGColor};
`;

export const FilterTitle = styled.h3`
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 20px;
  font-weight: 400;
  line-height: 1.4;
  letter-spacing: 0.02px;
  text-transform: uppercase;

  color: ${({ theme }) => theme.color.mainColor5};
`;

export const List = styled.ul`
  display: flex;

  flex-direction: column;
  gap: 4px;
  box-shadow: 0px 4px 6px 0px rgba(17, 17, 17, 0.1);
`;

export const Button = styled.button`
  border: none;
  background-color: transparent;
  padding: 2px 12px;
  width: 305px;
  cursor: pointer;

  font-family: 'Open Sans Hebrew', sans-serif;
  text-align: start;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.43;

  color: ${({ theme }) => theme.color.mainColor5};
`;

export const StyledIconArrowUp = styled(IconArrow)`
  transform: ${({ $openOutfitsList }) =>
    $openOutfitsList ? 'rotate(270deg)' : 'rotate(90deg)'};
  cursor: pointer;
`;

export const ButtonCalendar = styled.button`
  position: absolute;
  top: 14px;
  left: -44px;
  border: none;
  padding: 0;
  cursor: pointer;

  background-color: transparent;
`;
