import { useState } from 'react';

import 'rc-slider/assets/index.css';
import {
  FilterTitle,
  List,
  MainItem,
  MaxValue,
  MinValue,
  StyledIconArrowDown,
  StyledIconArrowUp,
  StyledSlider,
  Wrap,
  WrapInsideList,
  WrapSlider,
} from './FilterPrice.styled';

const FilterPrice = () => {
  const [isPriceList, setIsPriceList] = useState(false);
  const [rangeValues, setRangeValues] = useState([0, 3000]);

  const handleOpenList = () => {
    return setIsPriceList(true);
  };

  const handleCloseList = () => {
    return setIsPriceList(false);
  };

  const handleRangeChange = values => {
    setRangeValues(values);
    return `${values[0]}`;
  };

  return (
    <MainItem $list={isPriceList}>
      <Wrap>
        <FilterTitle>ЦІНА</FilterTitle>
        <StyledIconArrowUp onClick={handleOpenList} />
      </Wrap>
      {isPriceList && (
        <List>
          <WrapInsideList>
            <FilterTitle>ЦІНА</FilterTitle>
            <StyledIconArrowDown onClick={handleCloseList} />
          </WrapInsideList>
          <WrapSlider>
            {/* <createSliderWithTooltip> */}
            <StyledSlider
              range
              min={0}
              max={3000}
              step={10}
              defaultValue={rangeValues}
              onChange={handleRangeChange}
              tipFormatter={value => `${value}%`}
            />
            <MinValue>{rangeValues[0]}</MinValue>
            <MaxValue>{rangeValues[1]}</MaxValue>
          </WrapSlider>
        </List>
      )}
    </MainItem>
  );
};

export default FilterPrice;
