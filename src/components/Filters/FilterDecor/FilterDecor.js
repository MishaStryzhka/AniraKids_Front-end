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
import { arrayofDecorProduct } from 'helpers';

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
          {arrayofDecorProduct.map(({ variantOfDecor, searchDecor }, index) => (
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
