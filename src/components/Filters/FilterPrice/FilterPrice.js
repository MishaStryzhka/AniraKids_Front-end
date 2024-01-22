import { useState } from 'react';

import 'rc-slider/assets/index.css';
import {
  FilterTitle,
  MainItem,
  MaxValue,
  MinValue,
  StyledIconArrowUp,
  StyledSlider,
  Wrap,
  WrapSlider,
} from './FilterPrice.styled';
import { useTranslation } from 'react-i18next';

const FilterPrice = () => {
  const [isPriceList, setIsPriceList] = useState(false);
  const [rangeValues, setRangeValues] = useState([0, 3000]);

  const { t } = useTranslation('translation', {
    keyPrefix: 'components.filterPrice',
  });

  const handleToggleList = () => {
    setIsPriceList(prevIsPriceList => !prevIsPriceList);
  };

  const handleRangeChange = values => {
    setRangeValues(values);
    return `${values[0]}`;
  };

  return (
    <MainItem>
      <Wrap $openPriceList={isPriceList === true}>
        <FilterTitle>{t('Price')}</FilterTitle>
        <StyledIconArrowUp
          onClick={handleToggleList}
          $openPriceList={isPriceList === true}
        />
      </Wrap>
      {isPriceList && (
        <WrapSlider>
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
      )}
    </MainItem>
  );
};

export default FilterPrice;
