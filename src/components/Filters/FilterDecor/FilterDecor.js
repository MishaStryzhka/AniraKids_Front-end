import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Button,
  FilterTitle,
  List,
  MainItem,
  StyledIconArrowDown,
  StyledIconArrowUp,
  Wrap,
  WrapInsideList,
} from './FilterDecor.styled';

const FilterDecor = () => {
  const [isFilterDecorList, setIsFilterDecorList] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  console.log('searchParams', searchParams);

  const handleOpenList = () => {
    return setIsFilterDecorList(true);
  };

  const handleCloseList = () => {
    return setIsFilterDecorList(false);
  };
  return (
    <MainItem $list={isFilterDecorList}>
      <Wrap>
        <FilterTitle>ДЕКОР</FilterTitle>
        <StyledIconArrowUp onClick={handleOpenList} />
      </Wrap>
      {isFilterDecorList && (
        <List>
          <WrapInsideList>
            <FilterTitle>ДЕКОР</FilterTitle>
            <StyledIconArrowDown onClick={handleCloseList} />
          </WrapInsideList>
          <li>
            <Button
              onClick={() => {
                setSearchParams({ Decor: 'accessuries' });
              }}
            >
              Аксесуари
            </Button>
          </li>
          <li>
            <Button
              onClick={() => {
                setSearchParams({ Decor: 'birthday' });
              }}
            >
              День народження
            </Button>
          </li>
          <li>
            <Button
              onClick={() => {
                setSearchParams({ Decor: 'Christmas' });
              }}
            >
              Різдво
            </Button>
          </li>
          <li>
            <Button
              onClick={() => {
                setSearchParams({ Decor: 'thematic-holidays' });
              }}
            >
              Тематичні свята
            </Button>
          </li>
          <li>
            <Button
              onClick={() => {
                setSearchParams({ Decor: 'textile' });
              }}
            >
              Текстиль
            </Button>
          </li>
          <li>
            <Button
              onClick={() => {
                setSearchParams({ Decor: 'blankets-for-baby' });
              }}
            >
              Пледи для малюків
            </Button>
          </li>
          <li>
            <Button
              onClick={() => {
                setSearchParams({ Decor: 'linens' });
              }}
            >
              Постільна білизна
            </Button>
          </li>
        </List>
      )}
    </MainItem>
  );
};

export default FilterDecor;
