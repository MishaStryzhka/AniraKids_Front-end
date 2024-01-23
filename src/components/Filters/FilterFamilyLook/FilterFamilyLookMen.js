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
import { arrayFamilyLookMen } from 'helpers';

const FilterFamilyLookMen = () => {
  const [isFamilyLookList, setIsFamilyLookList] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  console.log('searchParams', searchParams);

  const { t } = useTranslation('translation', {
    keyPrefix: 'components.filterFamilyLook',
  });
  console.log(t);

  const handleToggleList = () => {
    setIsFamilyLookList(prevIsFamilyLookList => !prevIsFamilyLookList);
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
          {arrayFamilyLookMen.map(({ valueVariant }, index) => (
            <li key={index}>
              <Button
                type="button"
                onClick={() => {
                  setSearchParams({ familyLook: valueVariant });
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
