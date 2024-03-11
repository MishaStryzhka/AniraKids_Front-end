import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Button,
  FilterTitle,
  ItemButton,
  ListButtons,
  StyledIconArrowUp,
  Wrap,
} from './FilterColor.styled';
import { useTranslation } from 'react-i18next';
import { arrayColorsProduct } from 'data';
import { MainFilterWrap } from '../filter.styled';

const FilterColor = () => {
  const [isFilterColorList, setIsFilterColorList] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const { t } = useTranslation('translation', {
    keyPrefix: 'components.filterColor',
  });

  const handleToggleList = () => {
    setIsFilterColorList(prevIsFilterColorList => !prevIsFilterColorList);
  };

  const newSetSearchParams = (key, value) => {
    setSearchParams(pref => {
      const params = new URLSearchParams(pref);
      params.set(key, value);
      return params;
    });
  };

  const removeParam = param => {
    setSearchParams(pref => {
      const params = new URLSearchParams(pref);
      params.delete(param);
      return params;
    });
  };

  return (
    <MainFilterWrap>
      <Wrap $openColorList={isFilterColorList === true}>
        <FilterTitle>{t('Color')}</FilterTitle>
        <StyledIconArrowUp
          onClick={handleToggleList}
          $openColorList={isFilterColorList === true}
        />
      </Wrap>
      {isFilterColorList && (
        <ListButtons>
          {arrayColorsProduct.map(({ color, colorCode }, index) => (
            <ItemButton key={index}>
              <Button
                color={colorCode}
                check={searchParams.get('color')?.split(',')?.includes(color)}
                onClick={() => {
                  const paramsColor =
                    searchParams.get('color')?.split(',') || [];

                  if (paramsColor?.includes(color)) {
                    const newParamsColor = paramsColor.filter(
                      param => param !== color
                    );
                    newParamsColor.length === 0
                      ? removeParam('color')
                      : newSetSearchParams('color', newParamsColor.join(','));
                  } else {
                    paramsColor.push(color);
                    newSetSearchParams('color', paramsColor.join(','));
                  }
                }}
              />
            </ItemButton>
          ))}
        </ListButtons>
      )}
    </MainFilterWrap>
  );
};

export default FilterColor;
