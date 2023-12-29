import IconArrow from 'images/icons/IconArrow';
import styled from 'styled-components';

export const MainItem = styled.li`
  width: 305px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const Wrap = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 12px;
  border-bottom: ${({ $openSubjectsList }) =>
    $openSubjectsList ? 'none' : '1px solid'};
  border-color: ${({ theme }) => theme.color.lightBGColor};
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
  border-bottom: 1px solid #ebdad1;
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
  transform: ${({ $openSubjectsList }) =>
    $openSubjectsList ? 'rotate(270deg)' : 'rotate(90deg)'};
  cursor: pointer;
`;
