import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import {
  Button,
  FilterTitle,
  List,
  StyledIconArrowUp,
  Wrap,
} from './FilterToys.styled';
import { arrayOfToysProduct } from 'data';
import { MainFilterWrap } from '../filter.styled';

const FilterOfToys = () => {
  const [isFilterToysList, setIsFilterToysList] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const { t } = useTranslation('translation', {
    keyPrefix: 'components.filterOfToys',
  });

  const handleToggleList = () => {
    setIsFilterToysList(prevIsFilterOutfitsList => !prevIsFilterOutfitsList);
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
                  typeOfToys === searchParams.get('toys')
                    ? removeParam('toys')
                    : newSetSearchParams('toys', typeOfToys);
                }}
              >
                {t(typeOfToys)}
              </Button>
            </li>
          ))}
        </List>
      )}
    </MainFilterWrap>
  );
};
export default FilterOfToys;
