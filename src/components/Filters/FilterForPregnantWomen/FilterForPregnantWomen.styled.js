import IconArrow from 'images/icons/IconArrow';
import styled from 'styled-components';

export const Wrap = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 12px;
  border-bottom: ${({ $openPregnancyList }) =>
    $openPregnancyList ? 'none' : '1px solid'};
  border-color: ${({ theme }) => theme.color.lightBGColor};
`;

export const WrapInsideList = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 12px;
`;

export const FilterTitle = styled.h3`
  @media screen and (max-width: 427.5px) {
    font-size: 5vw;
  }
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 20px;
  font-weight: 400;
  line-height: 1.4;
  letter-spacing: 0.02px;
  text-transform: uppercase;

  color: ${({ theme }) => theme.color.mainColor5};
`;

export const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;

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
  transform: ${({ $openPregnancyList }) =>
    $openPregnancyList ? 'rotate(270deg)' : 'rotate(90deg)'};
  cursor: pointer;
`;
