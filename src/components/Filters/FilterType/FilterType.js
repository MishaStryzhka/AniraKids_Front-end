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

const arrayType = ['sale', 'rent'];

const FilterType = () => {
  const [isFilterTypeList, setIsFilterTypeList] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const { t } = useTranslation('translation', {
    keyPrefix: 'components.filterType',
  });

  const handleToggleList = () => {
    setIsFilterTypeList(prevIsFilterOutfitsList => !prevIsFilterOutfitsList);
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
    <MainItem>
      <Wrap $openOutfitsList={isFilterTypeList === true}>
        <FilterTitle>{t('type')}</FilterTitle>
        <StyledIconArrowUp
          onClick={handleToggleList}
          $openOutfitsList={isFilterTypeList === true}
        />
      </Wrap>
      {isFilterTypeList && (
        <List>
          {arrayType.map((type, index) => (
            <li key={index}>
              <Button
                type="button"
                onClick={() => {
                  type === searchParams.get('type')
                    ? removeParam('type')
                    : newSetSearchParams('type', type);
                }}
              >
                {t(type)}
              </Button>
            </li>
          ))}
        </List>
      )}
    </MainItem>
  );
};
export default FilterType;
