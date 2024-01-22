import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Button,
  FilterTitle,
  List,
  MainItem,
  StyledIconArrowUp,
  Wrap,
} from './FilterAge.styled';
import { arrayAgeProduct } from 'helpers';
import { useTranslation } from 'react-i18next';

const FilterAge = () => {
  const [isFilterAgeList, setIsFilterAgeList] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  console.log('searchParams', searchParams);

  const { t } = useTranslation('translation', {
    keyPrefix: 'components.filterAge',
  });

  const handleToggleList = () => {
    setIsFilterAgeList(prevIsFilterAgeList => !prevIsFilterAgeList);
  };

  return (
    <MainItem>
      <Wrap $openAgeList={isFilterAgeList === true}>
        <FilterTitle>{t('Age')}</FilterTitle>
        <StyledIconArrowUp
          $openAgeList={isFilterAgeList === true}
          onClick={handleToggleList}
        />
      </Wrap>
      {isFilterAgeList && (
        <List>
          {arrayAgeProduct.map(({ descriptionAge, valueAge }, index) => (
            <li key={index}>
              <Button
                type="button"
                onClick={() => {
                  setSearchParams({ Age: valueAge });
                }}
              >
                {descriptionAge}
              </Button>
            </li>
          ))}
        </List>
      )}
    </MainItem>
  );
};

export default FilterAge;
