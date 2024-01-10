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
import { nanoid } from '@reduxjs/toolkit';

const ArrayFamilyLook = [
  {
    id: 1,
    variantOfFamilyLook: 'Для всієї сім’ї',
    searchVariant: 'for-all-family',
  },
  {
    id: 2,
    variantOfFamilyLook: 'Для мами і дівчинки',
    searchVariant: 'for-mother-and-girl',
  },
  {
    id: 3,
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
          {ArrayFamilyLook.map(({ id, variantOfFamilyLook, searchVariant }) => (
            <li key={nanoid()}>
              <Button
                type="button"
                onClick={() => {
                  setSearchParams({ familyLook: searchVariant });
                }}
              >
                {variantOfFamilyLook}
              </Button>
            </li>
          ))}
        </List>
      )}
    </MainItem>
  );
};

export default FilterFamilyLook;
