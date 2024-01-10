import { nanoid } from '@reduxjs/toolkit';
import {
  Button,
  FilterTitle,
  List,
  MainItem,
  StyledIconArrowUp,
  Wrap,
} from './FilterForPregnantWomen.styled';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const ArrayPregnancy = [
  { id: 1, isPregnancy: 'Так', searchVariant: 'true' },
  { id: 2, isPregnancy: 'Ні', searchVariant: 'false' },
];

const FilterForPregnantWomen = () => {
  const [isPregnancyList, setIsPregnancyList] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  console.log('searchParams', searchParams);

  const handleToggleList = () => {
    setIsPregnancyList(prevIsPregnancyList => !prevIsPregnancyList);
  };

  return (
    <MainItem>
      <Wrap $openPregnancyList={isPregnancyList === true}>
        <FilterTitle> ДЛЯ ВАГІТНИХ</FilterTitle>
        <StyledIconArrowUp
          onClick={handleToggleList}
          $openPregnancyList={isPregnancyList === true}
        />
      </Wrap>
      {isPregnancyList && (
        <List>
          {ArrayPregnancy.map(({ id, isPregnancy, searchVariant }) => (
            <li key={nanoid()}>
              <Button
                type="button"
                onClick={() => {
                  setSearchParams({ Pregnancy: searchVariant });
                }}
              >
                {isPregnancy}
              </Button>
            </li>
          ))}
        </List>
      )}
    </MainItem>
  );
};

export default FilterForPregnantWomen;
