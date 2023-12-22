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

export const StyledRangeWrapper = styled.div`
  display: flex;
  align-items: center;
  width: 272px;
`;

export const StyledSliderMax = styled.input`
  width: inherit;
  height: 2px;
  border-radius: 5px;
  color: black;
  background-color: black;
  outline: none;
  cursor: pointer;
  opacity: 0.7;
  /* transition: opacity 0.2s;  */

  /* &:hover {
    opacity: 1;
  } */
`;

export const StyledSliderMin = styled.input`
  width: inherit;
  height: 2px;
  border-radius: 5px;
  background: black;
  outline: none;
  opacity: 0.7;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }
`;

export const StyledValue = styled.div`
  margin-top: 5px;
  font-size: 14px;
`;

// export const Input = styled.input`
//   width: 272px;
//   height: 2px;
//   border-radius: 5px;
//   outline: none;
//   opacity: 0.7;
//   transition: opacity 0.2s;

//   background-color: ${({ theme }) => theme.color.mainColor5};

//   &:hover {
//     opacity: 1;
//   }

//   &::-webkit-slider-thumb {
//     -webkit-appearance: none;
//     appearance: none;
//     width: 20px;
//     height: 20px;
//     border-radius: 50%;
//     background: #4caf50;
//     cursor: pointer;
//   }

//   &::-moz-range-thumb {
//     width: 20px;
//     height: 20px;
//     border-radius: 50%;
//     background: #4caf50;
//     cursor: pointer;
//   }
// `;

// export const Button = styled.button`
//   border: none;
//   background-color: transparent;
//   padding: 2px 12px;
//   width: 305px;

//   font-family: 'Open Sans Hebrew', sans-serif;
//   text-align: start;
//   font-size: 14px;
//   font-weight: 400;
//   line-height: 1.43;

//   color: ${({ theme }) => theme.color.mainColor5};
// `;

export const StyledIconArrowUp = styled(IconArrow)`
  transform: rotate(90deg);
`;

export const StyledIconArrowDown = styled(IconArrow)`
  transform: rotate(270deg);
`;
