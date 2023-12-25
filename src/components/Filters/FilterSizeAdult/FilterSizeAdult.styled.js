import IconArrow from 'images/icons/IconArrow';
import styled from 'styled-components';

export const MainItem = styled.li`
  width: 305px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  border: 1px dashed blue;
  border-image: repeating-linear-gradient(
    to right,
    black 0,
    black 10px,
    transparent 10px,
    transparent 20px
  );
  padding: ${({ $list }) => ($list ? '16px' : '0')};
`;

export const Wrap = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 12px;
  border-bottom: 1px solid #ebdad1;
`;

export const WrapInsideList = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 12px;
`;

export const FilterTitle = styled.h3`
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 20px;
  font-weight: 400;
  line-height: 1.4;
  letter-spacing: 0.02px;

  color: ${({ theme }) => theme.color.mainColor5};
`;

export const List = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const WrapButtons = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

export const Button = styled.button`
  border: 1px solid;

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
  transform: rotate(90deg);
`;

export const StyledIconArrowDown = styled(IconArrow)`
  transform: rotate(270deg);
`;
