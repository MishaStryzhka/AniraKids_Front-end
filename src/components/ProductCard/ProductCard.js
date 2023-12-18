import {
  LikeButton,
  PictureCard,
  Price,
  Span,
  TextName,
  TextPrice,
  TextSize,
  Wrap,
  WrapCard,
  WrapText,
} from './ProductCard.styled';
import CardImage from 'images/photo-product.jpg';
import theme from 'components/theme';
import { useAuth } from 'hooks';
import IconLittleHeart from 'images/icons/IconLittleHeart';

const ProductCard = () => {
  const { currentTheme } = useAuth();
  return (
    <WrapCard>
      <PictureCard>
        <img src={CardImage} alt="Фотографія продукту" />
      </PictureCard>
      <LikeButton>
        <IconLittleHeart stroke={theme[currentTheme].color.mainColor1} />
      </LikeButton>
      <WrapText>
        <Wrap>
          <TextName>HOUSE OF THE BREND</TextName>
          <TextSize>
            <Span>Розмір:</Span>
            XXXL
          </TextSize>
        </Wrap>
        <Wrap>
          <Price>Продаж</Price>
          <TextPrice>100 $</TextPrice>
        </Wrap>
      </WrapText>
    </WrapCard>
  );
};

export default ProductCard;
