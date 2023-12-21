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

const FilterSizeChildren = () => {
  const [isSizeChildrenList, setIsSizeChildrenList] = useState(false);

  const handleOpenList = () => {
    return setIsSizeChildrenList(true);
  };

  const handleCloseList = () => {
    return setIsSizeChildrenList(false);
  };
  return (
    <MainItem list={isSizeChildrenList}>
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
              <Button>
                98-104 см 104-110 см 110-116 см 116-122 см 122-128 см 128-134 см
                134-140 см 140-146 см 146-152 см 152-158 см 158-164 см 164-170
                см
              </Button>
            </li>
            <li>
              <Button>до 50 см</Button>
            </li>
            <li>
              <Button>50-56 см</Button>
            </li>
            <li>
              <Button>56-62 см</Button>
            </li>
            <li>
              <Button>62-68 см</Button>
            </li>
            <li>
              <Button>68-74 см</Button>
            </li>
            <li>
              <Button>74-80 см</Button>
            </li>
            <li>
              <Button>80-86 см</Button>
            </li>
            <li>
              <Button>86-92 см</Button>
            </li>
            <li>
              <Button>92-98 см</Button>
            </li>
            <li>
              <Button> 98-104 см</Button>
            </li>
            <li>
              <Button>104-110 см</Button>
            </li>
            <li>
              <Button>92-98 см</Button>
            </li>
          </WrapButtons>
        </List>
      )}
    </MainItem>
  );
};

export default FilterSizeChildren;
