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
} from './FilterType.styled';

const arrayParamsType = [
  {
    variantOfType: 'Продаж',
    searchParams: 'Sale',
  },
  {
    variantOfType: 'Оренда',
    searchParams: 'Rent',
  },
];

const FilterType = () => {
  const [isFilterTypeList, setIsFilterTypeList] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  console.log('searchParams', searchParams);

  const { t } = useTranslation('translation', {
    keyPrefix: 'components.filterType',
  });

  const handleToggleList = () => {
    setIsFilterTypeList(prevIsFilterOutfitsList => !prevIsFilterOutfitsList);
  };
  return (
    <MainItem>
      <Wrap $openOutfitsList={isFilterTypeList === true}>
        <FilterTitle>{t('Type')}</FilterTitle>
        <StyledIconArrowUp
          onClick={handleToggleList}
          $openOutfitsList={isFilterTypeList === true}
        />
      </Wrap>
      {isFilterTypeList && (
        <List>
          {arrayParamsType.map(({ searchParams }, index) => (
            <li key={index}>
              <Button
                type="button"
                onClick={() => {
                  setSearchParams({ Type: searchParams });
                }}
              >
                {t(searchParams)}
              </Button>
            </li>
          ))}
        </List>
      )}
    </MainItem>
  );
};
export default FilterType;
