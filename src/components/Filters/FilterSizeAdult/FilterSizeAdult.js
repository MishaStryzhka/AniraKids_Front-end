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
import { arraySizeAdult } from 'helpers';

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
