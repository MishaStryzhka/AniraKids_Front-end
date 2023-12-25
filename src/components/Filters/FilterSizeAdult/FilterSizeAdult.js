import { useState } from 'react';
import {
  Button,
  FilterTitle,
  List,
  MainItem,
  StyledIconArrowDown,
  StyledIconArrowUp,
  Wrap,
  WrapButtons,
  WrapInsideList,
} from './FilterSizeAdult.styled';
import { useSearchParams } from 'react-router-dom';

const FilterSizeAdult = () => {
  const [isSizeAdultList, setIsSizeAdultList] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const handleOpenList = () => {
    return setIsSizeAdultList(true);
  };

  const handleCloseList = () => {
    return setIsSizeAdultList(false);
  };
  return (
    <MainItem $list={isSizeAdultList}>
      <Wrap>
        <FilterTitle>РОЗМІР</FilterTitle>
        <StyledIconArrowUp onClick={handleOpenList} />
      </Wrap>
      {isSizeAdultList && (
        <List>
          <WrapInsideList>
            <FilterTitle>РОЗМІР</FilterTitle>
            <StyledIconArrowDown onClick={handleCloseList} />
          </WrapInsideList>
          <WrapButtons>
            <li>
              <Button
                onClick={() => {
                  setSearchParams({ size: 'XS' });
                }}
              >
                XS
              </Button>
            </li>
            <li>
              <Button
                onClick={() => {
                  setSearchParams({ size: 'S' });
                }}
              >
                S
              </Button>
            </li>
            <li>
              <Button
                onClick={() => {
                  setSearchParams({ size: 'M' });
                }}
              >
                M
              </Button>
            </li>
            <li>
              <Button
                onClick={() => {
                  setSearchParams({ size: 'L' });
                }}
              >
                L
              </Button>
            </li>
            <li>
              <Button
                onClick={() => {
                  setSearchParams({ size: 'XL' });
                }}
              >
                XL
              </Button>
            </li>
            <li>
              <Button
                onClick={() => {
                  setSearchParams({ size: 'XXL' });
                }}
              >
                XXL
              </Button>
            </li>
            <li>
              <Button
                onClick={() => {
                  setSearchParams({ size: 'XXXL' });
                }}
              >
                XXXL
              </Button>
            </li>
          </WrapButtons>
        </List>
      )}
    </MainItem>
  );
};

export default FilterSizeAdult;
