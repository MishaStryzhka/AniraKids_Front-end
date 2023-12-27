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
} from './FilterAge.styled';

const FilterAge = () => {
  const [isFilterAgeList, setIsFilterAgeList] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  console.log('searchParams', searchParams);

  const handleOpenList = () => {
    return setIsFilterAgeList(true);
  };

  const handleCloseList = () => {
    return setIsFilterAgeList(false);
  };

  return (
    <MainItem $list={isFilterAgeList}>
      <Wrap>
        <FilterTitle>ВІК</FilterTitle>
        <StyledIconArrowUp onClick={handleOpenList} />
      </Wrap>
      {isFilterAgeList && (
        <List>
          <WrapInsideList>
            <FilterTitle>ВІК</FilterTitle>
            <StyledIconArrowDown onClick={handleCloseList} />
          </WrapInsideList>
          <li>
            <Button
              onClick={() => {
                setSearchParams({ Age: 'premature' });
              }}
            >
              для передчасно народжених
            </Button>
          </li>
          <li>
            <Button
              onClick={() => {
                setSearchParams({ Age: 'newborns' });
              }}
            >
              для новонароджених
            </Button>
          </li>
          <li>
            <Button
              onClick={() => {
                setSearchParams({ Age: '0-3-months' });
              }}
            >
              0-3 місяці
            </Button>
          </li>
          <li>
            <Button
              onClick={() => {
                setSearchParams({ Age: '4-6-months' });
              }}
            >
              4-6 місяців
            </Button>
          </li>
          <li>
            <Button
              onClick={() => {
                setSearchParams({ Age: '7-9-months' });
              }}
            >
              7-9 місяців
            </Button>
          </li>
          <li>
            <Button
              onClick={() => {
                setSearchParams({ Age: '10-12-months' });
              }}
            >
              10-12 місяців
            </Button>
          </li>
          <li>
            <Button
              onClick={() => {
                setSearchParams({ Age: '13-18-months' });
              }}
            >
              13-18 місяців
            </Button>
          </li>
          <li>
            <Button
              onClick={() => {
                setSearchParams({ Age: '1.5-2-years' });
              }}
            >
              1,5-2 роки
            </Button>
          </li>
          <li>
            <Button
              onClick={() => {
                setSearchParams({ Age: '2-3-years' });
              }}
            >
              2-3 роки
            </Button>
          </li>
          <li>
            <Button
              onClick={() => {
                setSearchParams({ Age: '3-4-years' });
              }}
            >
              3-4 роки
            </Button>
          </li>
          <li>
            <Button
              onClick={() => {
                setSearchParams({ Age: '4-5-years' });
              }}
            >
              4-5 роки
            </Button>
          </li>
          <li>
            <Button
              onClick={() => {
                setSearchParams({ Age: '6-7-years' });
              }}
            >
              6-7 років
            </Button>
          </li>
          <li>
            <Button
              onClick={() => {
                setSearchParams({ Age: '8-9-years' });
              }}
            >
              8-9 років
            </Button>
          </li>
          <li>
            <Button
              onClick={() => {
                setSearchParams({ Age: '10-years' });
              }}
            >
              10 років
            </Button>
          </li>
          <li>
            <Button
              onClick={() => {
                setSearchParams({ Age: '11-years' });
              }}
            >
              11 років
            </Button>
          </li>
          <li>
            <Button
              onClick={() => {
                setSearchParams({ Age: '12-years' });
              }}
            >
              12 років
            </Button>
          </li>
          <li>
            <Button
              onClick={() => {
                setSearchParams({ Age: '13-years' });
              }}
            >
              13 років
            </Button>
          </li>
        </List>
      )}
    </MainItem>
  );
};

export default FilterAge;
