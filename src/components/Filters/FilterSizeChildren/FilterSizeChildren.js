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

export const arraySizeChildren = [
  {
    descriptionSize: 'до 50',
    searchSize: 'before-50',
  },
  {
    descriptionSize: '50-56 ',
    searchSize: '50-56',
  },
  {
    descriptionSize: '62-68',
    searchSize: '62-68',
  },
  {
    descriptionSize: '68-74',
    searchSize: '68-74',
  },
  {
    descriptionSize: '74-80',
    searchSize: '74-80',
  },
  {
    descriptionSize: '80-86',
    searchSize: '80-86',
  },
  {
    descriptionSize: '86-92',
    searchSize: '86-92',
  },
  {
    descriptionSize: '92-98',
    searchSize: '92-98',
  },
  {
    descriptionSize: '98-104',
    searchSize: '98-104',
  },
  {
    descriptionSize: '104-110',
    searchSize: '104-110',
  },
  {
    descriptionSize: '110-116',
    searchSize: '110-116',
  },
  {
    descriptionSize: '116-122',
    searchSize: '116-122',
  },
  {
    descriptionSize: '122-128',
    searchSize: '122-128',
  },
  {
    descriptionSize: '128-134',
    searchSize: '128-134',
  },
  {
    descriptionSize: '134-140',
    searchSize: '134-140',
  },
  {
    descriptionSize: '140-146',
    searchSize: '140-146',
  },
  {
    descriptionSize: '146-152',
    searchSize: '146-152',
  },
  {
    descriptionSize: '152-158',
    searchSize: '152-158',
  },
  {
    descriptionSize: '158-164',
    searchSize: '158-164',
  },
  {
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
            {arraySizeChildren.map(({ descriptionSize, searchSize }, index) => (
              <li key={index}>
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
