import IconArrow from 'images/icons/IconArrow';
import styled from 'styled-components';

export const MainItem = styled.li`
  max-width: 210px;
  list-style: none;
  display: flex;
  flex-direction: column;
  position: relative;
  gap: 4px;
  margin-bottom: 24px;
  position: relative;
  z-index: 2;
  @media screen and (min-width: 768px) {
    min-width: 305px;
    justify-content: space-between;
  }
  @media screen and (min-width: 1280px) {
  }
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

  position: absolute;
  z-index: 2;
  top: 56px;

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
