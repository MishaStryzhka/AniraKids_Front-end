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

export const arrayOfSubjects = [
  {
    variantOfSubjects: 'Різдво',
    searchSubjects: 'Christmas',
  },
  {
    variantOfSubjects: 'Українська символіка',
    searchSubjects: 'Ukrainian-symbols',
  },
  {
    variantOfSubjects: 'Звірята',
    searchSubjects: 'Animals',
  },
  {
    variantOfSubjects: 'Балет та принцеси',
    searchSubjects: 'ballet-&-princesses',
  },
  {
    variantOfSubjects: 'Динозаври',
    searchSubjects: 'Dinosaurs',
  },
  {
    variantOfSubjects: 'Квіти і метелики',
    searchSubjects: 'Flowers-&-butterflies',
  },
  {
    variantOfSubjects: 'Сердечки',
    searchSubjects: 'Hearts',
  },
  {
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
          {arrayOfSubjects.map(
            ({ variantOfSubjects, searchSubjects }, index) => (
              <li key={index}>
                <Button
                  type="button"
                  onClick={() => {
                    setSearchParams({ Outfits: searchSubjects });
                  }}
                >
                  {variantOfSubjects}
                </Button>
              </li>
            )
          )}
        </List>
      )}
    </MainItem>
  );
};

export default FilterSubject;
