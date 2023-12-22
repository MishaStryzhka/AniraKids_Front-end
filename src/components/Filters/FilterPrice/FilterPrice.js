import { useState } from 'react';
import {
  FilterTitle,
  List,
  MainItem,
  StyledIconArrowDown,
  StyledIconArrowUp,
  StyledRangeWrapper,
  StyledSliderMax,
  StyledSliderMin,
  StyledValue,
  Wrap,
  WrapInsideList,
} from './FilterPrice.styled';

const FilterPrice = () => {
  const [isPriceList, setIsPriceList] = useState(false);
  const [rangeValues, setRangeValues] = useState({ min: 0, max: 3000 });

  const handleOpenList = () => {
    return setIsPriceList(true);
  };

  const handleCloseList = () => {
    return setIsPriceList(false);
  };

  const handleRangeChange = (event, key) => {
    const value = event.target.value;
    setRangeValues(prevRange => ({ ...prevRange, [key]: value }));
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
          <StyledRangeWrapper>
            <StyledSliderMin
              type="range"
              min="0"
              max="250"
              step="1"
              value={rangeValues.min}
              onChange={e => handleRangeChange(e, 'min')}
            />
            <StyledValue>{rangeValues.min}</StyledValue>
            <StyledSliderMax
              type="range"
              min="250"
              max="3000"
              step="1"
              value={rangeValues.max}
              onChange={e => handleRangeChange(e, 'max')}
            />
            <StyledValue>{rangeValues.max}</StyledValue>
          </StyledRangeWrapper>
        </List>
      )}
    </MainItem>
  );
};

export default FilterPrice;
