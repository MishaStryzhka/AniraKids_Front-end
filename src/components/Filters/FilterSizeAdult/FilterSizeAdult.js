import { useState } from 'react';
import {
  Button,
  FilterTitle,
  List,
  MainItem,
  StyledIconArrowUp,
  Wrap,
  WrapButtons,
} from './FilterSizeAdult.styled';
import { useSearchParams } from 'react-router-dom';

const arraySizeAdult = [
  {
    id: 1,
    descriptionSize: 'XS',
    searchSize: 'XS',
  },
  {
    id: 2,
    descriptionSize: 'S',
    searchSize: 'S',
  },
  {
    id: 3,
    descriptionSize: 'M',
    searchSize: 'M',
  },
  {
    id: 4,
    descriptionSize: 'L',
    searchSize: 'L',
  },
  {
    id: 5,
    descriptionSize: 'XL',
    searchSize: 'XL',
  },
  {
    id: 5,
    descriptionSize: 'XXL',
    searchSize: 'XXL',
  },
  {
    id: 5,
    descriptionSize: 'XXXL',
    searchSize: 'XXXL',
  },
];

const FilterSizeAdult = () => {
  const [isSizeAdultList, setIsSizeAdultList] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  console.log('searchParams', searchParams);

  const handleToggleList = () => {
    setIsSizeAdultList(prevIsSizeAdultList => !prevIsSizeAdultList);
  };
  return (
    <MainItem>
      <Wrap $openSizeList={isSizeAdultList === true}>
        <FilterTitle>РОЗМІР</FilterTitle>
        <StyledIconArrowUp
          onClick={handleToggleList}
          $openSizeList={isSizeAdultList === true}
        />
      </Wrap>
      {isSizeAdultList && (
        <List>
          <WrapButtons>
            {arraySizeAdult.map(({ id, descriptionSize, searchSize }) => (
              <li key={id}>
                <Button
                  onClick={() => {
                    setSearchParams({ size: searchSize });
                  }}
                >
                  {descriptionSize}
                </Button>
              </li>
            ))}
          </WrapButtons>
        </List>
      )}
    </MainItem>
  );
};

export default FilterSizeAdult;
