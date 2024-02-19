import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import {
  Button,
  FilterTitle,
  List,
  MainItem,
  StyledIconArrowUp,
  Wrap,
} from './FilterToys.styled';
import { arrayOfToysProduct } from 'data';

const FilterOfToys = () => {
  const [isFilterToysList, setIsFilterToysList] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  console.log('searchParams', searchParams);

  const { t } = useTranslation('translation', {
    keyPrefix: 'components.filterOfToys',
  });

  const handleToggleList = () => {
    setIsFilterToysList(prevIsFilterOutfitsList => !prevIsFilterOutfitsList);
  };
  return (
    <MainItem>
      <Wrap $openOutfitsList={isFilterToysList === true}>
        <FilterTitle>{t('Toys')}</FilterTitle>
        <StyledIconArrowUp
          onClick={handleToggleList}
          $openOutfitsList={isFilterToysList === true}
        />
      </Wrap>
      {isFilterToysList && (
        <List>
          {arrayOfToysProduct.map(({ typeOfToys }, index) => (
            <li key={index}>
              <Button
                type="button"
                onClick={() => {
                  setSearchParams({ Toys: typeOfToys });
                }}
              >
                {t(typeOfToys)}
              </Button>
            </li>
          ))}
        </List>
      )}
    </MainItem>
  );
};
export default FilterOfToys;
