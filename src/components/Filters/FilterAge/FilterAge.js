import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Button,
  FilterTitle,
  List,
  MainItem,
  StyledIconArrowUp,
  Wrap,
} from './FilterAge.styled';
import { nanoid } from '@reduxjs/toolkit';

const ageArray = [
  {
    id: 1,
    descriptionAge: 'для передчасно народжених',
    searchAge: 'premature',
  },
  {
    id: 2,
    descriptionAge: 'для новонароджених',
    searchAge: 'newborns',
  },
  {
    id: 2,
    descriptionAge: '0-3 місяці',
    searchAge: '0-3-months',
  },
  {
    id: 3,
    descriptionAge: '4-6 місяців',
    searchAge: '4-6-months',
  },
  {
    id: 4,
    descriptionAge: '7-9 місяців',
    searchAge: '7-9-months',
  },
  {
    id: 5,
    descriptionAge: '10-12 місяців',
    searchAge: '10-12-months',
  },
  {
    id: 6,
    descriptionAge: '13-18 місяців',
    searchAge: '13-18-months',
  },
  {
    id: 7,
    descriptionAge: '1,5-2 роки',
    searchAge: '1.5-2-years',
  },
  {
    id: 8,
    descriptionAge: '2-3 роки',
    searchAge: '2-3-years',
  },
  {
    id: 9,
    descriptionAge: '3-4 роки',
    searchAge: '3-4-years',
  },
  {
    id: 10,
    descriptionAge: '4-5 роки',
    searchAge: '4-5-years',
  },
  {
    id: 11,
    descriptionAge: '6-7 років',
    searchAge: '6-7-years',
  },
  {
    id: 12,
    descriptionAge: '8-9 років',
    searchAge: '8-9-years',
  },
  {
    id: 13,
    descriptionAge: '10 років',
    searchAge: '10-years',
  },
  {
    id: 14,
    descriptionAge: '11 років',
    searchAge: '11-years',
  },
  {
    id: 15,
    descriptionAge: '12 років',
    searchAge: '12-years',
  },
  {
    id: 16,
    descriptionAge: '13 років',
    searchAge: '13-years',
  },
];

const FilterAge = () => {
  const [isFilterAgeList, setIsFilterAgeList] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  console.log('searchParams', searchParams);

  const handleToggleList = () => {
    setIsFilterAgeList(prevIsFilterAgeList => !prevIsFilterAgeList);
  };

  return (
    <MainItem>
      <Wrap $openAgeList={isFilterAgeList === true}>
        <FilterTitle>ВІК</FilterTitle>
        <StyledIconArrowUp
          $openAgeList={isFilterAgeList === true}
          onClick={handleToggleList}
        />
      </Wrap>
      {isFilterAgeList && (
        <List>
          {ageArray.map(({ id, descriptionAge, searchAge }) => (
            <li key={nanoid()}>
              <Button
                type="button"
                onClick={() => {
                  setSearchParams({ Age: searchAge });
                }}
              >
                {descriptionAge}
              </Button>
            </li>
          ))}
        </List>
      )}
    </MainItem>
  );
};

export default FilterAge;
