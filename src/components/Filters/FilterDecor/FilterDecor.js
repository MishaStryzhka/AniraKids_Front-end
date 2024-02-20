import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Button,
  FilterTitle,
  List,
  StyledIconArrowUp,
  Wrap,
} from './FilterDecor.styled';
import { useTranslation } from 'react-i18next';
import { arrayofDecorProduct } from 'data';
import { MainFilterWrap } from '../filter.styled';

const FilterDecor = () => {
  const [isFilterDecorList, setIsFilterDecorList] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const { t } = useTranslation('translation', {
    keyPrefix: 'components.filterDecor',
  });

  const handleToggleList = () => {
    setIsFilterDecorList(prevIsFilterDecorList => !prevIsFilterDecorList);
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
      <Wrap $openDecorList={isFilterDecorList === true}>
        <FilterTitle>{t('Decor')}</FilterTitle>
        <StyledIconArrowUp
          onClick={handleToggleList}
          $openDecorList={isFilterDecorList === true}
        />
      </Wrap>
      {isFilterDecorList && (
        <List>
          {arrayofDecorProduct.map(({ searchDecor }, index) => (
            <li key={index}>
              <Button
                type="button"
                onClick={() => {
                  searchDecor === searchParams.get('decor')
                    ? removeParam('decor')
                    : newSetSearchParams('decor', searchDecor);
                }}
              >
                {t(searchDecor)}
              </Button>
            </li>
          ))}
        </List>
      )}
    </MainFilterWrap>
  );
};

export default FilterDecor;
