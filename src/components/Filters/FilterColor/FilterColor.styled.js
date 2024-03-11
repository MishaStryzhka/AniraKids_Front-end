import IconArrow from 'images/icons/IconArrow';
import styled from 'styled-components';

export const Wrap = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 12px;
  border-bottom: ${({ $openColorList }) =>
    $openColorList ? 'none' : '1px solid'};
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

export const ListButtons = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  border-bottom: 1px solid #ebdad1;
`;

export const ItemButton = styled.li`
  padding: 3px;
`;

export const Button = styled.button`
  border: ${({ color }) => (color === '#FFF' ? '1px solid black' : 'none')};
  border-radius: ${({ check }) => (check ? '20px' : '2px')};
  width: 18px;
  height: 18px;
  cursor: pointer;
  background: ${({ color }) => color};
`;

export const StyledIconArrowUp = styled(IconArrow)`
  transform: ${({ $openColorList }) =>
    $openColorList ? 'rotate(270deg)' : 'rotate(90deg)'};
  cursor: pointer;
`;
