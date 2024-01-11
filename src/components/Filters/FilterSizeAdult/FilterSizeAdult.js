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

export const arraySizeAdult = [
  {
    descriptionSize: 'XS',
    searchSize: 'XS',
  },
  {
    descriptionSize: 'S',
    searchSize: 'S',
  },
  {
    descriptionSize: 'M',
    searchSize: 'M',
  },
  {
    descriptionSize: 'L',
    searchSize: 'L',
  },
  {
    descriptionSize: 'XL',
    searchSize: 'XL',
  },
  {
    descriptionSize: 'XXL',
    searchSize: 'XXL',
  },
  {
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
            {arraySizeAdult.map(({ descriptionSize, searchSize }, index) => (
              <li key={index}>
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
