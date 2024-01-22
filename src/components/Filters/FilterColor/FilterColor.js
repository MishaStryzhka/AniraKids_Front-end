import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Button,
  FilterTitle,
  ItemButton,
  List,
  ListButtons,
  MainItem,
  StyledIconArrowUp,
  Wrap,
} from './FilterColor.styled';
import { arrayColorsProduct } from 'helpers';
import { useTranslation } from 'react-i18next';

const FilterColor = () => {
  const [isFilterColorList, setIsFilterColorList] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  console.log('searchParams', searchParams);

  const [selectedColor, setSelectedColor] = useState(null);
  console.log(selectedColor);

  const { t } = useTranslation('translation', {
    keyPrefix: 'components.filterColor',
  });

  const handleColorClick = color => {
    setSelectedColor(color);
  };

  const handleToggleList = () => {
    setIsFilterColorList(prevIsFilterColorList => !prevIsFilterColorList);
  };
  return (
    <MainItem>
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
                    handleColorClick({ ColorVariant: color });
                    setSearchParams({ ColorVariant: color });
                  }}
                />
              </ItemButton>
            ))}
          </ListButtons>
        </List>
      )}
    </MainItem>
  );
};

export default FilterColor;
