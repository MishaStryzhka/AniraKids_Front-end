import { useState } from 'react';
import {
  Button,
  FilterTitle,
  List,
  MainItem,
  StyledIconArrowDown,
  StyledIconArrowUp,
  Wrap,
} from './FilterFamilyLook.styled';
import { WrapInsideList } from '../FilterForPregnantWomen/FilterForPregnantWomen.styled';
import { useSearchParams } from 'react-router-dom';

const FilterFamilyLook = () => {
  const [isFamilyLookList, setIsFamilyLookList] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  console.log('searchParams', searchParams);

  const handleOpenList = () => {
    return setIsFamilyLookList(true);
  };

  const handleCloseList = () => {
    return setIsFamilyLookList(false);
  };
  return (
    <MainItem $list={isFamilyLookList}>
      <Wrap>
        <FilterTitle>FAMILY LOOK</FilterTitle>
        <StyledIconArrowUp onClick={handleOpenList} />
      </Wrap>
      {isFamilyLookList && (
        <List>
          <WrapInsideList>
            <FilterTitle>FAMILY LOOK</FilterTitle>
            <StyledIconArrowDown onClick={handleCloseList} />
          </WrapInsideList>
          <li>
            <Button
              onClick={() => {
                setSearchParams({ familyLook: 'for-all-family' });
              }}
            >
              Для всієї сім’ї
            </Button>
          </li>
          <li>
            <Button
              onClick={() => {
                setSearchParams({ familyLook: 'for-mother-and-girl' });
              }}
            >
              Для мами і дівчинки
            </Button>
          </li>
          <li>
            <Button
              onClick={() => {
                setSearchParams({ familyLook: 'for-mother-and-boy' });
              }}
            >
              Для мами і хлопчика
            </Button>
          </li>
        </List>
      )}
    </MainItem>
  );
};

export default FilterFamilyLook;
