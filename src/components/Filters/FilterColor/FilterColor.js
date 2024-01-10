import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Button,
  FilterTitle,
  ItemButton,
  List,
  ListButtons,
  MainItem,
  StyledIconArrowUp,
  Wrap,
} from './FilterColor.styled';
import { nanoid } from '@reduxjs/toolkit';

export const colors = [
  { color: 'white', nameColor: 'Білий', colorCode: '#FFF', id: '1' },
  { color: 'gray', nameColor: 'Сірий', colorCode: '#A7A7A7', id: '2' },
  { color: 'orange', nameColor: 'Помаранчевий', colorCode: '#FFB833', id: '3' },
  { color: 'turquoise', nameColor: 'Бірюзовий', colorCode: '#30D5C8', id: '4' },
  { color: 'green', nameColor: 'Зелений', colorCode: '#59AF5F', id: '5' },
  { color: 'black', nameColor: 'Чорний', colorCode: '#000000', id: '6' },
  { color: 'bordo', nameColor: 'Бордовий', colorCode: '#900020', id: '7' },
  { color: 'lilac', nameColor: 'Бузковий', colorCode: '#C8A2C8', id: '8' },
  { color: 'silvery', nameColor: 'Сріблястий', colorCode: '#EDEEF0', id: '9' },
  { color: 'yellow', nameColor: 'Жовтий', colorCode: '#FFF633', id: '10' },
  { color: 'pink', nameColor: 'Рожевий', colorCode: '#FFC0CB', id: '11' },
  { color: 'blue', nameColor: 'Синій', colorCode: '#3395D2', id: '12' },
  { color: 'violet', nameColor: 'Фіолетовий', colorCode: '#9A339B', id: '13' },
  {
    color: 'colorful',
    nameColor: 'Різнокольоровий',
    colorCode:
      'linear-gradient(138deg, #FFF500 -16.67%, rgba(0, 74, 218, 0.70) 45.48%, #004E24 89.42%)',
    id: '14',
  },
  {
    color: 'light-green',
    nameColor: 'Салатовий',
    colorCode: '#97FF32',
    id: '15',
  },
  { color: 'coral', nameColor: 'Кораловий', colorCode: '#FF7F50', id: '16' },
  { color: 'beige', nameColor: 'Бежевий', colorCode: '#F6E6D1', id: '17' },
  { color: 'golden', nameColor: 'Золотистий', colorCode: '#FFE133', id: '18' },
  { color: 'red', nameColor: 'Червоний', colorCode: '#FF0000', id: '19' },
  { color: 'khaki', nameColor: 'Хакі', colorCode: '#9E9B6B', id: '20' },
  { color: 'brown', nameColor: 'Коричневий', colorCode: '#855D33', id: '21' },
  {
    color: 'light-blue',
    nameColor: 'Блакитний',
    colorCode: '#00BFFF',
    id: '22',
  },
  { color: 'peachy', nameColor: 'Персиковий', colorCode: '#FFE5B4', id: '23' },
  { color: 'mustard', nameColor: 'Гірчичний', colorCode: '#CAAC00', id: '24' },
];

const FilterColor = () => {
  const [isFilterColorList, setIsFilterColorList] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  console.log('searchParams', searchParams);

  const [selectedColor, setSelectedColor] = useState(null);
  console.log(selectedColor);

  const handleColorClick = color => {
    setSelectedColor(color);
  };

  const handleToggleList = () => {
    setIsFilterColorList(prevIsFilterColorList => !prevIsFilterColorList);
  };
  return (
    <MainItem>
      <Wrap $openColorList={isFilterColorList === true}>
        <FilterTitle>КОЛІР</FilterTitle>
        <StyledIconArrowUp
          onClick={handleToggleList}
          $openColorList={isFilterColorList === true}
        />
      </Wrap>
      {isFilterColorList && (
        <List>
          <ListButtons>
            {colors.map(({ color, id, colorCode }) => (
              <ItemButton key={nanoid()}>
                <Button
                  color={colorCode}
                  onClick={() => {
                    handleColorClick({ ColorVariant: color });
                    setSearchParams({ ColorVariant: color });
                  }}
                />
              </ItemButton>
            ))}
          </ListButtons>
        </List>
      )}
    </MainItem>
  );
};

export default FilterColor;
