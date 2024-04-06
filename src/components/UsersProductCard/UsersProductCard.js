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
  SpanPrice,
  StyledIconPencil,
  StyledIconBasket,
  WrapText,
} from './UsersProductCard.styled';
import { useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import theme from 'components/theme';
import { useAuth, useStorage } from 'hooks';
import {
  addToFavorites,
  removeFromFavorites,
} from '../../redux/auth/operations';
import IconLittleHeart from 'images/icons/IconLittleHeart';
import RatingStars from 'components/RatingStars/RatingStars';
import IconCross from 'images/icons/IconCross';
import { useEffect, useState } from 'react';

const UsersProductCard = ({
  product,
  handleRemove,
  handleUpdate,
  onRemoveFavorite,
  to,
  state,
}) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.usersProductCard',
  });
  const { user, currentTheme, isLoading } = useAuth();
  const storage = useStorage();
  const { pathname } = useLocation();
  const [favorites, setFavorites] = useState(
    user?.favorites || storage.get('favorites') || []
  );

  useEffect(() => {
    user?.favorites && setFavorites(user?.favorites);
  }, [user?.favorites]);

  const dispatch = useDispatch();

  const handleAddToFavorites = id => {
    if (user) {
      onRemoveFavorite && onRemoveFavorite();
      user?.favorites?.includes(id)
        ? dispatch(removeFromFavorites(id))
        : dispatch(addToFavorites(id));
    } else {
      if (storage?.get('favorites')?.includes(id)) {
        storage.set(
          'favorites',
          storage.get('favorites').filter(favorite => favorite !== id)
        );
        setFavorites(prevFavorites =>
          prevFavorites.filter(favorite => favorite !== id)
        );
      } else {
        const favorites = storage.get('favorites')
          ? [...storage.get('favorites'), id]
          : [id];
        storage.set('favorites', favorites);
        setFavorites(prevFavorites => [...prevFavorites, id]);
      }
    }
  };

  return (
    <Card
      to={to || `./${product?._id}`}
      state={state || null}
      $pageRentOut={pathname === '/my-account/rent-out'}
    >
      <GeneralWrap>
        <div
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            display: 'flex',
            gap: 8,
          }}
        >
          {user && pathname !== '/my-account/rent-out' && (
            <ButtonAddToFavorites
              disabled={isLoading}
              onClick={e => {
                e.preventDefault();
                handleAddToFavorites(product?._id);
              }}
            >
              {pathname === '/my-account/favorite' ? (
                <IconCross />
              ) : (
                <IconLittleHeart
                  fill={
                    favorites?.includes(product?._id) ? '#fff' : 'transparent'
                  }
                  stroke={theme[currentTheme].color.mainColor1}
                />
              )}
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
              <StyledIconPencil />
            </ButtonAddToFavorites>
          )}
          {pathname === '/my-account/rent-out' && (
            <ButtonAddToFavorites
              type="button"
              onClick={e => {
                e.preventDefault();
                handleRemove(product);
              }}
            >
              <StyledIconBasket />
            </ButtonAddToFavorites>
          )}
        </div>

        <PictureCard
        // $pageRentOut={pathname === '/my-account/rent-out'}
        >
          <Image src={product?.photos[0]?.path} alt="Фотографія продукту" />
        </PictureCard>
        <WrapText
        // $pageRentOut={pathname === '/my-account/rent-out'}
        >
          <FirstWrap
          // $pageRentOut={pathname === '/my-account/rent-out'}
          >
            <TextName>{product?.name || 'brand'}</TextName>
            <TextSize>
              <Span>{t('Size')}:</Span>
              {product?.size || product?.childSize}
            </TextSize>
          </FirstWrap>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {product?.rental && (
              <SecondWrap>
                <Price $productPage={pathname === `./${product?._id}`}>
                  {t('Rental')}
                </Price>
                <div>
                  {product.dailyRentalPrice && (
                    <TextPrice>
                      {product.dailyRentalPrice} <SpanPrice> kč/den</SpanPrice>
                    </TextPrice>
                  )}
                  {product.hourlyRentalPrice && (
                    <TextPrice>
                      {product.hourlyRentalPrice} <SpanPrice> kč/hod</SpanPrice>
                    </TextPrice>
                  )}
                  {product.rentalPrice && (
                    <TextPrice>
                      {product.rentalPrice}
                      <SpanPrice> kč/den</SpanPrice>
                    </TextPrice>
                  )}
                </div>
              </SecondWrap>
            )}
            {product?.sale && (
              <SecondWrap>
                <Price $productPage={pathname === `./${product?._id}`}>
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
              <UserNickname>{product?.owner?.nickname}</UserNickname>
            </div>
          </WrapPartSeller>
        </WrapText>
      </GeneralWrap>
    </Card>
  );
};

export default UsersProductCard;
