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
  console.log('searchParams', searchParams);

  const { t } = useTranslation('translation', {
    keyPrefix: 'components.filterDecor',
  });

  const handleToggleList = () => {
    setIsFilterDecorList(prevIsFilterDecorList => !prevIsFilterDecorList);
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
                  setSearchParams({ Decor: searchDecor });
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
