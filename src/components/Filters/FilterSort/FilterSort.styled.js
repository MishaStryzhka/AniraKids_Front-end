import IconArrow from 'images/icons/IconArrow';
import styled from 'styled-components';

export const MainWrapFilter = styled.div`
  @media screen and (max-width: 427.5px) {
    min-width: 46.7vw;
  }
  min-width: 200px;
  display: flex;
  position: relative;
  gap: 4px;
  margin-bottom: 24px;
  position: relative;
  z-index: 2;
  @media screen and (min-width: 768px) {
    min-width: 305px;
    justify-content: space-between;
  }
`;

export const Wrap = styled.div`
  position: absolute;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-color: ${({ theme }) => theme.color.lightBGColor};

  ${({ theme, $openOutfitsList }) =>
    $openOutfitsList
      ? `border-radius: 2px; background: ${theme.color.mainColor1}; box-shadow: 0px 4px 6px 0px rgba(17, 17, 17, 0.1); border-bottom: none;`
      : `border-bottom: 1px solid ${theme.color.lightBGColor};`}
`;

export const FilterTitle = styled.h3`
  @media screen and (max-width: 427.5px) {
    font-size: 5vw;
  }
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 20px;
  font-weight: 400;
  line-height: 1.4;
  text-transform: uppercase;

  color: ${({ theme }) => theme.color.mainColor5};
`;

export const List = styled.ul`
  display: flex;

  flex-direction: column;
  gap: 4px;

  // position: absolute;
  // z-index: 2;
  // top: 56px;
`;

export const Button = styled.button`
  border: none;
  background-color: transparent;
  padding: 2px 12px;
  width: 100%;
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

export const InnerWrap = styled.div`
  @media screen and (max-width: 427.5px) {
    padding-bottom: 2.8vw;
  }
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
`;
