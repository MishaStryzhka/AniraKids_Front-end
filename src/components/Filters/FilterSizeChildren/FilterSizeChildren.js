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
} from './FilterSizeChildren.styled';
import { useSearchParams } from 'react-router-dom';

const FilterSizeChildren = () => {
  const [isSizeChildrenList, setIsSizeChildrenList] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  console.log('searchParams', searchParams);

  const handleOpenList = () => {
    return setIsSizeChildrenList(true);
  };

  const handleCloseList = () => {
    return setIsSizeChildrenList(false);
  };
  return (
    <MainItem $list={isSizeChildrenList}>
      <Wrap>
        <FilterTitle>РОЗМІР</FilterTitle>
        <StyledIconArrowUp onClick={handleOpenList} />
      </Wrap>
      {isSizeChildrenList && (
        <List>
          <WrapInsideList>
            <FilterTitle>РОЗМІР</FilterTitle>
            <StyledIconArrowDown onClick={handleCloseList} />
          </WrapInsideList>
          <WrapButtons>
            <li>
              <Button
                onClick={() => {
                  setSearchParams({ size: 'before-50' });
                }}
              >
                до 50 см
              </Button>
            </li>
            <li>
              <Button
                onClick={() => {
                  setSearchParams({ size: '50-56' });
                }}
              >
                50-56 см
              </Button>
            </li>
            <li>
              <Button
                onClick={() => {
                  setSearchParams({ size: '56-62' });
                }}
              >
                56-62 см
              </Button>
            </li>
            <li>
              <Button
                onClick={() => {
                  setSearchParams({ size: '62-68' });
                }}
              >
                62-68 см
              </Button>
            </li>
            <li>
              <Button
                onClick={() => {
                  setSearchParams({ size: '68-74' });
                }}
              >
                68-74 см
              </Button>
            </li>
            <li>
              <Button
                onClick={() => {
                  setSearchParams({ size: '74-80' });
                }}
              >
                74-80 см
              </Button>
            </li>
            <li>
              <Button
                onClick={() => {
                  setSearchParams({ size: '80-86' });
                }}
              >
                80-86 см
              </Button>
            </li>
            <li>
              <Button
                onClick={() => {
                  setSearchParams({ size: '86-92' });
                }}
              >
                86-92 см
              </Button>
            </li>
            <li>
              <Button
                onClick={() => {
                  setSearchParams({ size: '92-98' });
                }}
              >
                92-98 см
              </Button>
            </li>
            <li>
              <Button
                onClick={() => {
                  setSearchParams({ size: '98-104' });
                }}
              >
                98-104 см
              </Button>
            </li>
            <li>
              <Button
                onClick={() => {
                  setSearchParams({ size: '104-110' });
                }}
              >
                104-110 см
              </Button>
            </li>
            <li>
              <Button
                onClick={() => {
                  setSearchParams({ size: '110-116' });
                }}
              >
                110-116 см
              </Button>
            </li>
            <li>
              <Button
                onClick={() => {
                  setSearchParams({ size: '116-122' });
                }}
              >
                {' '}
                116-122 см
              </Button>
            </li>
            <li>
              <Button
                onClick={() => {
                  setSearchParams({ size: '122-128' });
                }}
              >
                122-128 см
              </Button>
            </li>
            <li>
              <Button
                onClick={() => {
                  setSearchParams({ size: '128-134' });
                }}
              >
                128-134 см
              </Button>
            </li>
            <li>
              <Button
                onClick={() => {
                  setSearchParams({ size: '134-140' });
                }}
              >
                134-140 см
              </Button>
            </li>
            <li>
              <Button
                onClick={() => {
                  setSearchParams({ size: '140-146' });
                }}
              >
                140-146 см
              </Button>
            </li>
            <li>
              <Button
                onClick={() => {
                  setSearchParams({ size: '146-152' });
                }}
              >
                146-152 см
              </Button>
            </li>
            <li>
              <Button
                onClick={() => {
                  setSearchParams({ size: '152-158' });
                }}
              >
                152-158 см
              </Button>
            </li>
            <li>
              <Button
                onClick={() => {
                  setSearchParams({ size: '168-164' });
                }}
              >
                158-164 см
              </Button>
            </li>
            <li>
              <Button
                onClick={() => {
                  setSearchParams({ size: '164-170' });
                }}
              >
                164-170 см
              </Button>
            </li>
          </WrapButtons>
        </List>
      )}
    </MainItem>
  );
};

export default FilterSizeChildren;
