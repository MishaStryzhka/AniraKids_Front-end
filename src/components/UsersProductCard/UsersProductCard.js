import { useTranslation } from 'react-i18next';
import {
  GeneralWrap,
  Image,
  Card,
  PictureCard,
  Price,
  Span,
  TextName,
  TextPrice,
  TextSize,
  ButtonAddToFavorites,
  WrapPartSeller,
  PictureSeller,
  ImageSeller,
  WrapTextSeller,
  UserNickname,
  WrapIconsStars,
  TextRating,
  SecondWrap,
  FirstWrap,
} from './UsersProductCard.styled';
import { WrapText } from 'components/ProductCard/ProductCard.styled';
import { useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import theme from 'components/theme';
import { useAuth } from 'hooks';
import {
  addToFavorites,
  removeFromFavorites,
} from '../../redux/auth/operations';
import IconLittleHeart from 'images/icons/IconLittleHeart';
import RatingStars from 'components/RatingStars/RatingStars';
import IconPencil from 'images/icons/IconPencil';
import IconBasket from 'images/icons/IconBasket';

const UsersProductCard = ({
  product,
  handleRemove,
  handleUpdate,
  onRemoveFavorite,
}) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.usersProductCard',
  });

  const { user, currentTheme, isLoading } = useAuth();
  console.log(user);
  const dispatch = useDispatch();

  const handleAddToFavorites = id => {
    onRemoveFavorite && onRemoveFavorite();
    user?.favorites.includes(id)
      ? dispatch(removeFromFavorites(id))
      : dispatch(addToFavorites(id));
  };

  const { pathname } = useLocation();

  return (
    <Card
      to={`./${product?._id}`}
      $pageRentOut={pathname === '/my-account/rent-out'}
      // {pathname !== '/my-account/rent-out' && ()}
    >
      <GeneralWrap $pageRentOut={pathname === '/my-account/rent-out'}>
        <div
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            display: 'flex',
            gap: 8,
          }}
        >
          {pathname !== '/my-account/rent-out' && (
            <ButtonAddToFavorites
              disabled={isLoading}
              onClick={e => {
                e.preventDefault();
                handleAddToFavorites(product?._id);
              }}
            >
              <IconLittleHeart
                fill={
                  user?.favorites.includes(product?._id)
                    ? '#fff'
                    : 'transparent'
                }
                stroke={theme[currentTheme].color.mainColor1}
              />
            </ButtonAddToFavorites>
          )}
          {pathname === '/my-account/rent-out' && (
            <ButtonAddToFavorites
              type="button"
              onClick={e => {
                e.preventDefault();
                handleUpdate(product._id);
              }}
            >
              <IconPencil />
            </ButtonAddToFavorites>
          )}
          {pathname === '/my-account/rent-out' && (
            <ButtonAddToFavorites
              type="button"
              onClick={e => {
                e.preventDefault();
                handleRemove(product._id);
              }}
            >
              <IconBasket />
            </ButtonAddToFavorites>
          )}
        </div>
        <PictureCard $pageRentOut={pathname === '/my-account/rent-out'}>
          <Image src={product?.photos[0]?.path} alt="Фотографія продукту" />
        </PictureCard>
        <WrapText $pageRentOut={pathname === '/my-account/rent-out'}>
          <FirstWrap $pageRentOut={pathname === '/my-account/rent-out'}>
            <TextName>{product?.brand || 'brand'}</TextName>
            <TextSize>
              <Span>{t('Size')}:</Span>
              {product?.size || product?.childSize}
            </TextSize>
          </FirstWrap>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {product?.rental && (
              <SecondWrap>
                <Price $pageRentOut={pathname === '/my-account/rent-out'}>
                  {t('Rental')}
                </Price>
                <div>
                  {product.dailyRentalPrice && (
                    <TextPrice>{product.dailyRentalPrice} kč/den</TextPrice>
                  )}
                  {product.hourlyRentalPrice && (
                    <TextPrice>{product.hourlyRentalPrice} Kč/hod</TextPrice>
                  )}
                  {product.rentalPrice && (
                    <TextPrice>{product.rentalPrice} kč/den</TextPrice>
                  )}
                </div>
              </SecondWrap>
            )}
            {product?.sale && (
              <SecondWrap>
                <Price $pageRentOut={pathname === '/my-account/rent-out'}>
                  {t('Sale')}
                </Price>
                <TextPrice style={{ textAlign: 'end' }}>
                  {product.salePrice} Kč
                </TextPrice>
              </SecondWrap>
            )}
          </div>
          <WrapPartSeller>
            <PictureSeller>
              <ImageSeller src={product?.owner?.avatar} />
            </PictureSeller>
            <div>
              <WrapTextSeller>
                <WrapIconsStars>
                  <RatingStars rating={product?.owner?.rating || 5} />
                </WrapIconsStars>
                <TextRating>
                  {product?.owner?.rating?.toFixed(1) || '5.0'}
                  {product?.owner?.ratingCount > 0 &&
                    `(${product?.owner?.ratingCount} ${t('ratings')})`}
                </TextRating>
              </WrapTextSeller>
              <UserNickname>{user?.nickname}</UserNickname>
            </div>
          </WrapPartSeller>
        </WrapText>
      </GeneralWrap>
    </Card>
  );
};

export default UsersProductCard;
