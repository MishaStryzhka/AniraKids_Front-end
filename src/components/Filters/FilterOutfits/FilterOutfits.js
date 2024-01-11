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

const arrayOfOutfits = [
  {
    variantOfOutfits: 'Для дівчаток',
    searchOutfits: 'for-girls',
  },
  {
    variantOfOutfits: 'Для хлопчиків',
    searchOutfits: 'for-boys',
  },
  {
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
          {arrayOfOutfits.map(({ variantOfOutfits, searchOutfits }, index) => (
            <li key={index}>
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
