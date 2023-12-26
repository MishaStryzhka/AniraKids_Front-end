import {
  Button,
  FilterTitle,
  List,
  MainItem,
  StyledIconArrowDown,
  StyledIconArrowUp,
  Wrap,
  WrapInsideList,
} from './FilterForPregnantWomen.styled';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const FilterForPregnantWomen = () => {
  const [isPragnancyList, setIsPragnancyList] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  console.log('searchParams', searchParams);

  // const newSetSearchParams = (key, value) => {
  //   setSearchParams(pref => {
  //     const Query = {};
  //     for (const [key, value] of pref.entries()) {
  //       Query[key] = value;
  //     }

  //     return {
  //       ...Query,
  //       [key]: value,
  //     };
  //   });
  // };

  const handleOpenList = () => {
    return setIsPragnancyList(true);
  };

  const handleCloseList = () => {
    return setIsPragnancyList(false);
  };

  return (
    <MainItem $list={isPragnancyList}>
      <Wrap>
        <FilterTitle> ДЛЯ ВАГІТНИХ</FilterTitle>
        <StyledIconArrowUp onClick={handleOpenList} />
      </Wrap>

      {isPragnancyList && (
        <List>
          <WrapInsideList>
            <FilterTitle> ДЛЯ ВАГІТНИХ</FilterTitle>
            <StyledIconArrowDown onClick={handleCloseList} />
          </WrapInsideList>
          <li>
            <Button
              onClick={() => {
                setSearchParams({ forPregnantWomen: true });
              }}
            >
              Так
            </Button>
          </li>
          <li>
            <Button
              onClick={() => {
                setSearchParams({ forPregnantWomen: false });
              }}
            >
              Ні
            </Button>
          </li>
        </List>
      )}
    </MainItem>
  );
};

export default FilterForPregnantWomen;
