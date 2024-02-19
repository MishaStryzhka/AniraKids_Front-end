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
import { useSearchParams } from 'react-router-dom';

const FilterPrice = () => {
  const [isPriceList, setIsPriceList] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  // console.log('qqq', searchParams.get('price').split('-').map(Number));

  const [rangeValues, setRangeValues] = useState([
    searchParams.get('price')
      ? searchParams.get('price').split('-').map(Number)[0]
      : 500,
    searchParams.get('price')
      ? searchParams.get('price').split('-').map(Number)[1]
      : 10000,
  ]);
  // eslint-disable-next-line no-unused-vars

  const { t } = useTranslation('translation', {
    keyPrefix: 'components.filterPrice',
  });

  const handleToggleList = () => {
    setIsPriceList(prevIsPriceList => !prevIsPriceList);
  };

  const handleRangeChange = values => {
    setRangeValues(values);

    newSetSearchParams('price', `${values[0]}-${values[1]}`);
    return `${values[0]}`;
  };

  const newSetSearchParams = (key, value) => {
    setSearchParams(pref => {
      const params = new URLSearchParams(pref);
      params.set(key, value);
      return params;
    });
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
            id="ex1"
            data-slider-id="ex1Slider"
            range
            min={500}
            max={10000}
            step={10}
            defaultValue={rangeValues}
            onAfterChange={handleRangeChange}
            tipFormatter={value => `${value} Kč`}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <MinValue>{rangeValues[0]}</MinValue>
            <MaxValue>{rangeValues[1]}</MaxValue>
          </div>
        </WrapSlider>
      )}
    </MainItem>
  );
};

export default FilterPrice;
