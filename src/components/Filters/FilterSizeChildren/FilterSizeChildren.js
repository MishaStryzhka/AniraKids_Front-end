import { useState } from 'react';
import {
  Button,
  FilterTitle,
  List,
  MainItem,
  StyledIconArrowUp,
  Wrap,
  WrapButtons,
} from './FilterSizeChildren.styled';
import { useSearchParams } from 'react-router-dom';
import { nanoid } from '@reduxjs/toolkit';

export const arraySizeChildren = [
  {
    id: 1,
    descriptionSize: 'до 50',
    searchSize: 'before-50',
  },
  {
    id: 2,
    descriptionSize: '50-56 ',
    searchSize: '50-56',
  },
  {
    id: 3,
    descriptionSize: '62-68',
    searchSize: '62-68',
  },
  {
    id: 4,
    descriptionSize: '68-74',
    searchSize: '68-74',
  },
  {
    id: 5,
    descriptionSize: '74-80',
    searchSize: '74-80',
  },
  {
    id: 6,
    descriptionSize: '80-86',
    searchSize: '80-86',
  },
  {
    id: 7,
    descriptionSize: '86-92',
    searchSize: '86-92',
  },
  {
    id: 8,
    descriptionSize: '92-98',
    searchSize: '92-98',
  },
  {
    id: 9,
    descriptionSize: '98-104',
    searchSize: '98-104',
  },
  {
    id: 10,
    descriptionSize: '104-110',
    searchSize: '104-110',
  },
  {
    id: 11,
    descriptionSize: '110-116',
    searchSize: '110-116',
  },
  {
    id: 12,
    descriptionSize: '116-122',
    searchSize: '116-122',
  },
  {
    id: 13,
    descriptionSize: '122-128',
    searchSize: '122-128',
  },
  {
    id: 14,
    descriptionSize: '128-134',
    searchSize: '128-134',
  },
  {
    id: 15,
    descriptionSize: '134-140',
    searchSize: '134-140',
  },
  {
    id: 16,
    descriptionSize: '140-146',
    searchSize: '140-146',
  },
  {
    id: 17,
    descriptionSize: '146-152',
    searchSize: '146-152',
  },
  {
    id: 18,
    descriptionSize: '152-158',
    searchSize: '152-158',
  },
  {
    id: 19,
    descriptionSize: '158-164',
    searchSize: '158-164',
  },
  {
    id: 20,
    descriptionSize: '164-170',
    searchSize: '164-170',
  },
];

const FilterSizeChildren = () => {
  const [isSizeChildrenList, setIsSizeChildrenList] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  console.log('searchParams', searchParams);

  const handleToggleList = () => {
    setIsSizeChildrenList(prevIsSizeChildrenList => !prevIsSizeChildrenList);
  };
  return (
    <MainItem>
      <Wrap $openSizeChildrenList={isSizeChildrenList === true}>
        <FilterTitle>РОЗМІР</FilterTitle>
        <StyledIconArrowUp
          onClick={handleToggleList}
          $openSizeChildrenList={isSizeChildrenList === true}
        />
      </Wrap>
      {isSizeChildrenList && (
        <List>
          <WrapButtons>
            {arraySizeChildren.map(({ id, descriptionSize, searchSize }) => (
              <li key={nanoid()}>
                <Button
                  type="button"
                  onClick={() => {
                    setSearchParams({ size: searchSize });
                  }}
                >
                  {descriptionSize} см
                </Button>
              </li>
            ))}
          </WrapButtons>
        </List>
      )}
    </MainItem>
  );
};

export default FilterSizeChildren;
