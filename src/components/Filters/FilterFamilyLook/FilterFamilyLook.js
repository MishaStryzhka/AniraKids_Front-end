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

const ArrayFamilyLook = [
  {
    variantOfFamilyLook: 'Для всієї сім’ї',
    searchVariant: 'for-all-family',
  },
  {
    variantOfFamilyLook: 'Для мами і дівчинки',
    searchVariant: 'for-mother-and-girl',
  },
  {
    variantOfFamilyLook: 'Для мами і хлопчика',
    searchVariant: 'for-mother-and-boy',
  },
];

const FilterFamilyLook = () => {
  const [isFamilyLookList, setIsFamilyLookList] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  console.log('searchParams', searchParams);

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
          {ArrayFamilyLook.map(
            ({ variantOfFamilyLook, searchVariant }, index) => (
              <li key={index}>
                <Button
                  type="button"
                  onClick={() => {
                    setSearchParams({ familyLook: searchVariant });
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
