import { useState } from 'react';
import {
  Button,
  FilterTitle,
  List,
  MainItem,
  StyledIconArrowUp,
  Wrap,
} from './FilterSubject.styled';
import { useSearchParams } from 'react-router-dom';

const arrayOfSubjects = [
  {
    id: 1,
    variantOfSubjects: 'Різдво',
    searchSubjects: 'Christmas',
  },
  {
    id: 2,
    variantOfSubjects: 'Українська символіка',
    searchSubjects: 'Ukrainian-symbols',
  },
  {
    id: 3,
    variantOfSubjects: 'Звірята',
    searchSubjects: 'Animals',
  },
  {
    id: 4,
    variantOfSubjects: 'Балет та принцеси',
    searchSubjects: 'ballet-&-princesses',
  },
  {
    id: 5,
    variantOfSubjects: 'Динозаври',
    searchSubjects: 'Dinosaurs',
  },
  {
    id: 6,
    variantOfSubjects: 'Квіти і метелики',
    searchSubjects: 'Flowers-&-butterflies',
  },
  {
    id: 7,
    variantOfSubjects: 'Сердечки',
    searchSubjects: 'Hearts',
  },
  {
    id: 8,
    variantOfSubjects: 'Єдинороги та веселки',
    searchSubjects: 'unicors-&-rainbows',
  },
];

const FilterSubject = () => {
  const [isFilterSubjectsList, setIsFilterSubjectsList] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  console.log('searchParams', searchParams);

  const handleToggleList = () => {
    setIsFilterSubjectsList(
      prevIsFilterOutfitsList => !prevIsFilterOutfitsList
    );
  };
  return (
    <MainItem>
      <Wrap $openSubjectsList={isFilterSubjectsList === true}>
        <FilterTitle>ТЕМАТИКА</FilterTitle>
        <StyledIconArrowUp
          onClick={handleToggleList}
          $openSubjectsList={isFilterSubjectsList === true}
        />
      </Wrap>
      {isFilterSubjectsList && (
        <List>
          {arrayOfSubjects.map(({ id, variantOfSubjects, searchSubjects }) => (
            <li key={id}>
              <Button
                onClick={() => {
                  setSearchParams({ Outfits: searchSubjects });
                }}
              >
                {variantOfSubjects}
              </Button>
            </li>
          ))}
        </List>
      )}
    </MainItem>
  );
};

export default FilterSubject;
