import { useState } from 'react';
import {
  Button,
  FilterTitle,
  List,
  MainItem,
  StyledIconArrowUp,
  Wrap,
} from './FilterSubject.styled';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { productSubjects } from 'data/dateForProduct';

const FilterSubject = () => {
  const [isFilterSubjectsList, setIsFilterSubjectsList] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [searchParams, setSearchParams] = useSearchParams();

  const { t } = useTranslation('translation', {
    keyPrefix: 'components.filterSubject',
  });

  const handleToggleList = () => {
    setIsFilterSubjectsList(
      prevIsFilterOutfitsList => !prevIsFilterOutfitsList
    );
  };

  const newSetSearchParams = (key, value) => {
    setSearchParams(pref => {
      const params = new URLSearchParams(pref);
      params.set(key, value);
      return params;
    });
  };
  return (
    <MainItem>
      <Wrap $openSubjectsList={isFilterSubjectsList === true}>
        <FilterTitle>{t('Subject')}</FilterTitle>
        <StyledIconArrowUp
          onClick={handleToggleList}
          $openSubjectsList={isFilterSubjectsList === true}
        />
      </Wrap>
      {isFilterSubjectsList && (
        <List>
          {productSubjects.map((valueSubject, index) => (
            <li key={index}>
              <Button
                type="button"
                onClick={() => {
                  newSetSearchParams('subject', valueSubject);
                }}
              >
                {t(valueSubject)}
              </Button>
            </li>
          ))}
        </List>
      )}
    </MainItem>
  );
};

export default FilterSubject;
