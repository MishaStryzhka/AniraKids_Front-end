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

export const colors = [
  { color: 'white', nameColor: 'Білий', colorCode: '#FFF' },
  { color: 'gray', nameColor: 'Сірий', colorCode: '#A7A7A7' },
  { color: 'orange', nameColor: 'Помаранчевий', colorCode: '#FFB833' },
  { color: 'turquoise', nameColor: 'Бірюзовий', colorCode: '#30D5C8' },
  { color: 'green', nameColor: 'Зелений', colorCode: '#59AF5F' },
  { color: 'black', nameColor: 'Чорний', colorCode: '#000000' },
  { color: 'bordo', nameColor: 'Бордовий', colorCode: '#900020' },
  { color: 'lilac', nameColor: 'Бузковий', colorCode: '#C8A2C8' },
  { color: 'silvery', nameColor: 'Сріблястий', colorCode: '#EDEEF0' },
  { color: 'yellow', nameColor: 'Жовтий', colorCode: '#FFF633' },
  { color: 'pink', nameColor: 'Рожевий', colorCode: '#FFC0CB' },
  { color: 'blue', nameColor: 'Синій', colorCode: '#3395D2' },
  { color: 'violet', nameColor: 'Фіолетовий', colorCode: '#9A339B' },
  {
    color: 'colorful',
    nameColor: 'Різнокольоровий',
    colorCode:
      'linear-gradient(138deg, #FFF500 -16.67%, rgba(0, 74, 218, 0.70) 45.48%, #004E24 89.42%)',
  },
  {
    color: 'light-green',
    nameColor: 'Салатовий',
    colorCode: '#97FF32',
  },
  { color: 'coral', nameColor: 'Кораловий', colorCode: '#FF7F50' },
  { color: 'beige', nameColor: 'Бежевий', colorCode: '#F6E6D1' },
  { color: 'golden', nameColor: 'Золотистий', colorCode: '#FFE133' },
  { color: 'red', nameColor: 'Червоний', colorCode: '#FF0000' },
  { color: 'khaki', nameColor: 'Хакі', colorCode: '#9E9B6B' },
  { color: 'brown', nameColor: 'Коричневий', colorCode: '#855D33' },
  {
    color: 'light-blue',
    nameColor: 'Блакитний',
    colorCode: '#00BFFF',
  },
  { color: 'peachy', nameColor: 'Персиковий', colorCode: '#FFE5B4' },
  { color: 'mustard', nameColor: 'Гірчичний', colorCode: '#CAAC00' },
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
            {colors.map(({ color, colorCode }, index) => (
              <ItemButton key={index}>
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
