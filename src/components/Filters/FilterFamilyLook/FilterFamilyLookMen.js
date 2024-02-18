import { useState } from 'react';
import {
  Button,
  FilterTitle,
  List,
  MainItem,
  StyledIconArrowUp,
  Wrap,
} from './FilterFamilyLook.styled';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { arrayFamilyLookProductMen } from 'data';

const FilterFamilyLookMen = () => {
  const [isFamilyLookList, setIsFamilyLookList] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [searchParams, setSearchParams] = useSearchParams();

  const { t } = useTranslation('translation', {
    keyPrefix: 'components.filterFamilyLook',
  });

  const handleToggleList = () => {
    setIsFamilyLookList(prevIsFamilyLookList => !prevIsFamilyLookList);
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
      <Wrap $openLookList={isFamilyLookList === true}>
        <FilterTitle>FAMILY LOOK</FilterTitle>
        <StyledIconArrowUp
          onClick={handleToggleList}
          $openLookList={isFamilyLookList === true}
        />
      </Wrap>
      {isFamilyLookList && (
        <List>
          {arrayFamilyLookProductMen.map((valueVariant, index) => (
            <li key={index}>
              <Button
                type="button"
                onClick={() => {
                  newSetSearchParams('familyLook', valueVariant);
                }}
              >
                {t(valueVariant)}
              </Button>
            </li>
          ))}
        </List>
      )}
    </MainItem>
  );
};

export default FilterFamilyLookMen;
