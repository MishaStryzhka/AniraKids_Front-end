import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import {
  Button,
  FilterTitle,
  List,
  MainWrapFilter,
  StyledIconArrowUp,
  Wrap,
} from './FilterSort.styled';

const arrayParamsSort = [
  'popularity',
  'expensive to cheap',
  'cheap to expensive',
  'new arrival',
];

const FilterSort = () => {
  const [isFilterSortList, setIsFilterSortList] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const { t } = useTranslation('translation', {
    keyPrefix: 'components.filterSort',
  });

  const handleToggleList = () => {
    setIsFilterSortList(prevIsFilterOutfitsList => !prevIsFilterOutfitsList);
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
    <MainWrapFilter>
      <Wrap $openOutfitsList={isFilterSortList === true}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: 12,
          }}
        >
          <FilterTitle>{t('Sort by')}</FilterTitle>
          <StyledIconArrowUp
            onClick={handleToggleList}
            $openOutfitsList={isFilterSortList === true}
          />
        </div>
        {isFilterSortList && (
          <List>
            {arrayParamsSort.map((sort, index) => (
              <li key={index}>
                <Button
                  type="button"
                  onClick={() => {
                    sort === searchParams.get('sort')
                      ? removeParam('sort')
                      : newSetSearchParams('sort', sort);
                  }}
                >
                  {t(sort)}
                </Button>
              </li>
            ))}
          </List>
        )}
      </Wrap>
    </MainWrapFilter>
  );
};
export default FilterSort;
