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
import { useTranslation } from 'react-i18next';

const ProductCard = () => {
  const { currentTheme } = useAuth();

  const { t } = useTranslation('translation', {
    keyPrefix: 'components.productCard',
  });

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
            <Span>{t('Size')}:</Span>
            XXXL
          </TextSize>
        </Wrap>
        <Wrap>
          <Price>{t('Sale')}</Price>
          <TextPrice>100 $</TextPrice>
        </Wrap>
      </WrapText>
    </WrapCard>
  );
};

export default ProductCard;
