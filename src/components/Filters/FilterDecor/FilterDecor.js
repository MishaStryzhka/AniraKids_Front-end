import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Button,
  FilterTitle,
  List,
  MainItem,
  StyledIconArrowUp,
  Wrap,
} from './FilterDecor.styled';
import { nanoid } from '@reduxjs/toolkit';

const ArrayofDecor = [
  { id: 1, variantOfDecor: 'Аксесуари', searchDecor: 'accessuries' },
  { id: 2, variantOfDecor: 'День народження', searchDecor: 'birthday' },
  { id: 3, variantOfDecor: 'Різдво', searchDecor: 'Christmas' },
  {
    id: 4,
    variantOfDecor: 'Тематичні свята',
    searchDecor: 'thematic-holidays',
  },
  {
    id: 5,
    variantOfDecor: 'Текстиль',
    searchDecor: 'textile',
  },
  {
    id: 6,
    variantOfDecor: 'Пледи для малюків',
    searchDecor: 'blankets-for-baby',
  },
  {
    id: 7,
    variantOfDecor: 'Постільна білизна',
    searchDecor: 'linens',
  },
];

const FilterDecor = () => {
  const [isFilterDecorList, setIsFilterDecorList] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  console.log('searchParams', searchParams);

  const handleToggleList = () => {
    setIsFilterDecorList(prevIsFilterDecorList => !prevIsFilterDecorList);
  };

  return (
    <MainItem>
      <Wrap $openDecorList={isFilterDecorList === true}>
        <FilterTitle>ДЕКОР</FilterTitle>
        <StyledIconArrowUp
          onClick={handleToggleList}
          $openDecorList={isFilterDecorList === true}
        />
      </Wrap>
      {isFilterDecorList && (
        <List>
          {ArrayofDecor.map(({ id, variantOfDecor, searchDecor }) => (
            <li key={nanoid()}>
              <Button
                type="button"
                onClick={() => {
                  setSearchParams({ Decor: searchDecor });
                }}
              >
                {variantOfDecor}
              </Button>
            </li>
          ))}
        </List>
      )}
    </MainItem>
  );
};

export default FilterDecor;
