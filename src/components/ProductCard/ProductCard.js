import {
  ButtonAddToFavorites,
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
import theme from 'components/theme';
import { useAuth } from 'hooks';
import IconLittleHeart from 'images/icons/IconLittleHeart';
import { useTranslation } from 'react-i18next';
import {
  addToFavorites,
  removeFromFavorites,
} from '../../redux/auth/operations';
import { useDispatch } from 'react-redux';

const ProductCard = ({ product }) => {
  const { user, currentTheme, isLoading } = useAuth();
  const dispatch = useDispatch();

  const { t } = useTranslation('translation', {
    keyPrefix: 'components.productCard',
  });

  const handleAddToFavorites = id => {
    user.favorites.includes(id)
      ? dispatch(removeFromFavorites(id))
      : dispatch(addToFavorites(id));
  };

  return (
    <WrapCard>
      <PictureCard>
        <img src={product?.photos[0]?.path} alt="Фотографія продукту" />
      </PictureCard>
      <ButtonAddToFavorites
        disabled={isLoading}
        onClick={() => handleAddToFavorites(product?._id)}
      >
        <IconLittleHeart
          fill={user.favorites.includes(product?._id) ? '#fff' : 'transparent'}
          stroke={theme[currentTheme].color.mainColor1}
        />
      </ButtonAddToFavorites>
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
