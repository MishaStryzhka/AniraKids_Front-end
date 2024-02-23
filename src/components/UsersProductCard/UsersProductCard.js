import { useTranslation } from 'react-i18next';
import {
  ButtonRemove,
  ButtonUpdate,
  GeneralWrap,
  IconBasketStyled,
  IconPencilStyled,
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
  StyledIconStar,
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
  console.log(product);

  const renderStars = () => {
    const starsCount = (Math.ceil(product.rating), 0); // Запобігаємо від'ємним значенням
    console.log(starsCount);
    if (starsCount === 0) {
      // Якщо рейтинг 0, повертаємо 5  зірок
      return Array.from({ length: 5 }, (_, index) => (
        <StyledIconStar key={index} />
      ));
    }

    // return Array.from({ length: 5 }, (_, index) => {
    //   return index < starsCount ? (
    //     <StyledIconStar key={index} />
    //   ) : (
    //     <StyledIconStarOutline key={index} />
    //   );
    // });
  };
  return (
    <Card
      to={pathname !== '/my-account/rent-out' && `./${product?._id}`}
      $pageRentOut={pathname === '/my-account/rent-out'}
      // {pathname !== '/my-account/rent-out' && ()}
    >
      <GeneralWrap $pageRentOut={pathname === '/my-account/rent-out'}>
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
                user?.favorites.includes(product?._id) ? '#fff' : 'transparent'
              }
              stroke={theme[currentTheme].color.mainColor1}
            />
          </ButtonAddToFavorites>
        )}
        <PictureCard $pageRentOut={pathname === '/my-account/rent-out'}>
          <Image src={product?.photos[0]?.path} alt="Фотографія продукту" />
        </PictureCard>
        <WrapText $pageRentOut={pathname === '/my-account/rent-out'}>
          <FirstWrap $pageRentOut={pathname === '/my-account/rent-out'}>
            <TextName>{product?.brand || 'brand'}</TextName>
            <TextSize>
              <Span>{t('Size')}:</Span>
              {product?.size}
            </TextSize>
          </FirstWrap>
          <SecondWrap>
            {product?.rental ? (
              <Price $pageRentOut={pathname === '/my-account/rent-out'}>
                {t('Rental')}
              </Price>
            ) : (
              product?.sale && (
                <Price $pageRentOut={pathname === '/my-account/rent-out'}>
                  {t('Sale')}
                </Price>
              )
            )}
            {product?.rentalPrice && (
              <TextPrice>{product.rentalPrice} CZK</TextPrice>
            )}
            {product?.salePrice && (
              <TextPrice>{product.salePrice} CZK</TextPrice>
            )}
          </SecondWrap>
        </WrapText>
      </GeneralWrap>
      {pathname === '/my-account/rent-out' && (
        <ButtonUpdate type="button" onClick={() => handleUpdate(product._id)}>
          {t('update')}
          <IconPencilStyled />
        </ButtonUpdate>
      )}
      {pathname === '/my-account/rent-out' && (
        <ButtonRemove type="button" onClick={() => handleRemove(product._id)}>
          {t('remove')}
          <IconBasketStyled />
        </ButtonRemove>
      )}
      {pathname !== '/my-account/rent-out' && (
        <WrapPartSeller>
          <PictureSeller>
            <ImageSeller src={user?.avatar} />
          </PictureSeller>
          <div>
            <WrapTextSeller>
              <WrapIconsStars>{renderStars()}</WrapIconsStars>
              <TextRating>5.0 (4 {t('ratings')})</TextRating>
            </WrapTextSeller>
            <UserNickname>{user?.nickname}</UserNickname>
          </div>
        </WrapPartSeller>
      )}
    </Card>
  );
};

export default UsersProductCard;
