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
import { arrayFamilyLookProduct } from 'helpers';
import { useTranslation } from 'react-i18next';

const FilterFamilyLook = () => {
  const [isFamilyLookList, setIsFamilyLookList] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  console.log('searchParams', searchParams);

  const { t } = useTranslation('translation', {
    keyPrefix: 'components.filterFamilyLookr',
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
          {arrayFamilyLookProduct.map(
            ({ variantOfFamilyLook, valueVariant }, index) => (
              <li key={index}>
                <Button
                  type="button"
                  onClick={() => {
                    setSearchParams({ familyLook: valueVariant });
                  }}
                >
                  {variantOfFamilyLook}
                </Button>
              </li>
            )
          )}
        </List>
      )}
    </MainItem>
  );
};

export default FilterFamilyLook;
