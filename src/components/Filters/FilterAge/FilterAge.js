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
import CheckBox from 'components/CheckBox/CheckBox';

const FilterAge = () => {
  const [isFilterAgeList, setIsFilterAgeList] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [searchParams, setSearchParams] = useSearchParams();

  const { t, i18n } = useTranslation('translation', {
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
          {arrayAgeProduct.map((productAge, index) => (
            <li key={index}>
              <Button
                type="button"
                onClick={() => {
                  const paramsAge = searchParams.get('age')?.split(',') || [];

                  if (paramsAge?.includes(productAge.age)) {
                    const newParamsAge = paramsAge.filter(
                      param => param !== productAge.age
                    );
                    newParamsAge.length === 0
                      ? removeParam('age')
                      : newSetSearchParams('age', newParamsAge.join(','));
                  } else {
                    paramsAge.push(productAge.age);
                    newSetSearchParams('age', paramsAge.join(','));
                  }
                }}
              >
                <CheckBox
                  value={searchParams
                    .get('age')
                    ?.split(',')
                    ?.includes(productAge.age)}
                />
                {productAge[i18n.language]}
              </Button>
            </li>
          ))}
        </List>
      )}
    </MainFilterWrap>
  );
};

export default FilterAge;
