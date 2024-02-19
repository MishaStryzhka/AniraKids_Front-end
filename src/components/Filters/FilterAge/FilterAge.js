import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Button,
  FilterTitle,
  List,
  StyledIconArrowUp,
  Wrap,
} from './FilterAge.styled';
import { useTranslation } from 'react-i18next';
import { arrayAgeProduct } from 'data';
import { MainFilterWrap } from '../filter.styled';

const FilterAge = () => {
  const [isFilterAgeList, setIsFilterAgeList] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [searchParams, setSearchParams] = useSearchParams();

  const { t } = useTranslation('translation', {
    keyPrefix: 'components.filterAge',
  });

  const handleToggleList = () => {
    setIsFilterAgeList(prevIsFilterAgeList => !prevIsFilterAgeList);
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
      <Wrap $openAgeList={isFilterAgeList === true}>
        <FilterTitle>{t('Age')}</FilterTitle>
        <StyledIconArrowUp
          $openAgeList={isFilterAgeList === true}
          onClick={handleToggleList}
        />
      </Wrap>
      {isFilterAgeList && (
        <List>
          {arrayAgeProduct.map(({ age }, index) => (
            <li key={index}>
              <Button
                type="button"
                onClick={() => {
                  age === searchParams.get('age')
                    ? removeParam('age')
                    : newSetSearchParams('age', age);
                }}
              >
                {t(age)}
              </Button>
            </li>
          ))}
        </List>
      )}
    </MainFilterWrap>
  );
};

export default FilterAge;
