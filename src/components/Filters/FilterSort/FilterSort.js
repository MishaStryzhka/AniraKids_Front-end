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
} from './FilterSort.styled';

const arrayParamsSort = [
  {
    variantOfParams: 'Від дорогих до дешевих',
    searchParams: 'From expensive to cheap',
  },
  {
    variantOfParams: 'Від дешевих до дорогих',
    searchParams: 'From cheap to expensive',
  },
  {
    variantOfParams: 'Новинка',
    searchParams: 'New arrival',
  },
];

const FilterSort = () => {
  const [isFilterSortList, setIsFilterSortList] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  console.log('searchParams', searchParams);

  const { t } = useTranslation('translation', {
    keyPrefix: 'components.filterSort',
  });

  const handleToggleList = () => {
    setIsFilterSortList(prevIsFilterOutfitsList => !prevIsFilterOutfitsList);
  };
  return (
    <MainItem>
      <Wrap $openOutfitsList={isFilterSortList === true}>
        <FilterTitle>{t('Sort by')}</FilterTitle>
        <StyledIconArrowUp
          onClick={handleToggleList}
          $openOutfitsList={isFilterSortList === true}
        />
      </Wrap>
      {isFilterSortList && (
        <List>
          {arrayParamsSort.map(({ searchParams }, index) => (
            <li key={index}>
              <Button
                type="button"
                onClick={() => {
                  setSearchParams({ Sort: searchParams });
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
export default FilterSort;
