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

const ArrayofDecor = [
  { variantOfDecor: 'Аксесуари', searchDecor: 'accessuries' },
  { variantOfDecor: 'День народження', searchDecor: 'birthday' },
  { variantOfDecor: 'Різдво', searchDecor: 'Christmas' },
  {
    variantOfDecor: 'Тематичні свята',
    searchDecor: 'thematic-holidays',
  },
  {
    variantOfDecor: 'Текстиль',
    searchDecor: 'textile',
  },
  {
    variantOfDecor: 'Пледи для малюків',
    searchDecor: 'blankets-for-baby',
  },
  {
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
          {ArrayofDecor.map(({ variantOfDecor, searchDecor }, index) => (
            <li key={index}>
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
