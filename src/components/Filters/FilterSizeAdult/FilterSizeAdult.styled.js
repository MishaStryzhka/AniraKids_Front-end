import IconArrow from 'images/icons/IconArrow';
import styled from 'styled-components';

export const Wrap = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 12px;
  border-bottom: ${({ $openSizeList }) =>
    $openSizeList ? 'none' : '1px solid'};
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
  padding-bottom: 4px;
  border-bottom: 1px solid #ebdad1;
`;

export const WrapButtons = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

export const Button = styled.button`
  border: 1px solid;
  cursor: pointer;
  background-color: transparent;
  padding: 2px 8px;

  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 20px;
  font-weight: 400;
  line-height: 1.4;
  letter-spacing: 0.02px;

  color: ${({ theme }) => theme.color.mainColor5};
  border-color: ${({ theme }) => theme.color.lightBGColor};
`;

export const StyledIconArrowUp = styled(IconArrow)`
  transform: ${({ $openSizeList }) =>
    $openSizeList ? 'rotate(270deg)' : 'rotate(90deg)'};
  cursor: pointer;
`;
