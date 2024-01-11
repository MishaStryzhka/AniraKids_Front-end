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

const ageArray = [
  {
    descriptionAge: 'для передчасно народжених',
    searchAge: 'premature',
  },
  {
    descriptionAge: 'для новонароджених',
    searchAge: 'newborns',
  },
  {
    descriptionAge: '0-3 місяці',
    searchAge: '0-3-months',
  },
  {
    descriptionAge: '4-6 місяців',
    searchAge: '4-6-months',
  },
  {
    descriptionAge: '7-9 місяців',
    searchAge: '7-9-months',
  },
  {
    descriptionAge: '10-12 місяців',
    searchAge: '10-12-months',
  },
  {
    descriptionAge: '13-18 місяців',
    searchAge: '13-18-months',
  },
  {
    descriptionAge: '1,5-2 роки',
    searchAge: '1.5-2-years',
  },
  {
    descriptionAge: '2-3 роки',
    searchAge: '2-3-years',
  },
  {
    descriptionAge: '3-4 роки',
    searchAge: '3-4-years',
  },
  {
    descriptionAge: '4-5 роки',
    searchAge: '4-5-years',
  },
  {
    descriptionAge: '6-7 років',
    searchAge: '6-7-years',
  },
  {
    descriptionAge: '8-9 років',
    searchAge: '8-9-years',
  },
  {
    descriptionAge: '10 років',
    searchAge: '10-years',
  },
  {
    descriptionAge: '11 років',
    searchAge: '11-years',
  },
  {
    descriptionAge: '12 років',
    searchAge: '12-years',
  },
  {
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
          {ageArray.map(({ descriptionAge, searchAge }, index) => (
            <li key={index}>
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
