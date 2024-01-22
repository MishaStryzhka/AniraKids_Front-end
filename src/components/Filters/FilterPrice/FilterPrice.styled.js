import IconArrow from 'images/icons/IconArrow';
import Slider from 'rc-slider';

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
  border-bottom: ${({ $openPriceList }) =>
    $openPriceList ? 'none' : '1px solid'};
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

export const StyledIconArrowUp = styled(IconArrow)`
  transform: ${({ $openPriceList }) =>
    $openPriceList ? 'rotate(270deg)' : 'rotate(90deg)'};
  cursor: pointer;
`;

export const WrapSlider = styled.div``;

export const StyledSlider = styled(Slider)`
  width: 272px;
  position: relative;

  .rc-slider-track {
    /* Трек */
    background-color: #000;
    height: 3px;
    border-radius: 0;
  }

  .rc-slider-handle {
    /*  бігунок */
    width: 1px;
    height: 10px;
    margin-top: -3.5px;
    overflow: hidden;
    border: 1px solid #000;
    opacity: 1;
    border-radius: 0;
    cursor: pointer;
  }

  .rc-slider-rail {
    /* Основна лінія */
    height: 1px;
    background-color: #000;
    top: 6px;
    border-radius: 0;
  }

  .rc-slider-tooltip {
    /* Стилі для Tooltip */
    visibility: visible !important;
    transform: translateX(-50%) translateY(-50%);
  }
`;

export const MinValue = styled.p`
  display: block;

  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.43;

  color: ${({ theme }) => theme.color.mainColor5};
`;

export const MaxValue = styled.p`
  display: block;

  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.43;

  color: ${({ theme }) => theme.color.mainColor5};
`;
