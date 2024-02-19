import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Button,
  FilterTitle,
  ItemButton,
  List,
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
        <List>
          <ListButtons>
            {arrayColorsProduct.map(({ color, colorCode }, index) => (
              <ItemButton key={index}>
                <Button
                  color={colorCode}
                  onClick={() => {
                    color === searchParams.get('color')
                      ? removeParam('color')
                      : newSetSearchParams('color', color);
                  }}
                />
              </ItemButton>
            ))}
          </ListButtons>
        </List>
      )}
    </MainFilterWrap>
  );
};

export default FilterColor;
