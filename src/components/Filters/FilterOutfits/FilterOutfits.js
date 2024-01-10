import { useState } from 'react';
import {
  Button,
  FilterTitle,
  List,
  MainItem,
  StyledIconArrowUp,
  Wrap,
} from './FilterOutfits.styled';
import { useSearchParams } from 'react-router-dom';
import { nanoid } from '@reduxjs/toolkit';

const arrayOfOutfits = [
  {
    id: 1,
    variantOfOutfits: 'Для дівчаток',
    searchOutfits: 'for-girls',
  },
  {
    id: 2,
    variantOfOutfits: 'Для хлопчиків',
    searchOutfits: 'for-boys',
  },
  {
    id: 3,
    variantOfOutfits: 'Для малюків',
    searchOutfits: 'for-babies',
  },
];

const FilterOutfits = () => {
  const [isFilterOutfitsList, setIsFilterOutfitsList] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  console.log('searchParams', searchParams);

  const handleToggleList = () => {
    setIsFilterOutfitsList(prevIsFilterOutfitsList => !prevIsFilterOutfitsList);
  };
  return (
    <MainItem>
      <Wrap $openOutfitsList={isFilterOutfitsList === true}>
        <FilterTitle>НАРЯДИ</FilterTitle>
        <StyledIconArrowUp
          onClick={handleToggleList}
          $openOutfitsList={isFilterOutfitsList === true}
        />
      </Wrap>
      {isFilterOutfitsList && (
        <List>
          {arrayOfOutfits.map(({ id, variantOfOutfits, searchOutfits }) => (
            <li key={nanoid()}>
              <Button
                type="button"
                onClick={() => {
                  setSearchParams({ Outfits: searchOutfits });
                }}
              >
                {variantOfOutfits}
              </Button>
            </li>
          ))}
        </List>
      )}
    </MainItem>
  );
};

export default FilterOutfits;
