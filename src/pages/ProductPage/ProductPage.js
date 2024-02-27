import { useLocation, useParams } from 'react-router-dom';
import {
  Border,
  Color,
  ImagesPerson,
  ItemReview,
  ListReviews,
  MainImage,
  PicturePerson,
  SecondaryImages,
  TextDescription,
  TextPrice,
  TextRent,
  TextRentValue,
  TextReview,
  TextSeller,
  TextSize,
  TextValueSize,
  TextWrap,
  Title,
  TitleDescription,
  TitleName,
  Wrap,
  WrapAllImages,
  WrapBtn,
  WrapColor,
  WrapDescription,
  WrapIconsStars,
  WrapInfo,
  WrapInformation,
  WrapInside,
  WrapPerson,
  WrapPersonInfo,
  WrapProductCard,
  WrapReviews,
  WrapSecondaryImages,
  WrapTimeRent,
  ButtonPreview,
  WrapCalendar,
  TextCalendar,
  ButtonCalendarTime,
  GeneralWrap,
  ButtonAddToFavorite,
  // List,
  // WrapList,
} from './ProductPage.styled';
import IconHeart from 'images/icons/IconHeart';
import { useTranslation } from 'react-i18next';
import Avatar from 'images/photo-ready-woman/photo-ready-mobile-1x.jpg';
import IconStar from 'images/icons/IconStart';
import Button from 'components/Button/Button';
import IconCalendarTime from 'images/icons/IconCalendarTime';
import 'react-alice-carousel/lib/alice-carousel.css';
import { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Scrollbar, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/scrollbar';
import 'swiper/css/navigation';
import IconChat from 'images/icons/IconChat';
import { useDispatch } from 'react-redux';
import {
  addToFavorites,
  removeFromFavorites,
} from '../../redux/auth/operations';
import {
  Price,
  SecondWrap,
} from 'components/UsersProductCard/UsersProductCard.styled';
import { useAuth } from 'hooks';

const api = require('../../api');

const ProductPage = onRemoveFavorite => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'pages.productPage',
  });
  const { pathname } = useLocation();
  const { id } = useParams();
  const { user } = useAuth();

  const handleSecondaryImageClick = index => {
    setCurrentImageIndex(index);
  };

  const [product, setProduct] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  // eslint-disable-next-line no-unused-vars
  const [error, setError] = useState();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    setIsLoading(true);

    api
      .getProductById(id)
      .then(data => {
        setProduct(data.product);
        setIsLoading(false);
      })
      .catch(error => {
        setError(error);
        setIsLoading(false);
      });
  }, [id]);

  const dispatch = useDispatch();
  const { user } = useAuth();

  const handleAddToFavorites = id => {
    // onRemoveFavorite && onRemoveFavorite();
    user?.favorites.includes(id)
      ? dispatch(removeFromFavorites(id))
      : dispatch(addToFavorites(id));
  };
  
  const handleSecondaryImageClick = index => {
    setCurrentImageIndex(index);
    // swiperRef.current.slideTo(index);
  };
  
  const width = window.innerWidth < 767;

  return isLoading ? (
    <p>Loading...</p>
  ) : (
    <GeneralWrap>
      <WrapProductCard
        $pageFavorites={pathname === `/my-account/favorite/${product?._id}`}
      >
        <WrapAllImages>
          <MainImage
            srcSet={product?.photos[currentImageIndex].path}
            alt="Main photo"
          />

          <WrapSecondaryImages>
            <Swiper
              modules={[Scrollbar, Navigation]}
              spaceBetween={8}
              slidesPerView={3}
              scrollbar={{ draggable: product?.photos.length > 3 && true }}
              direction={width ? 'horizontal' : 'vertical'}
              height={'auto'}
            >
              {product?.photos.map(({ path }, index) => (
                <SwiperSlide key={index}>
                  <SecondaryImages
                    srcSet={`${path}`}
                    alt="All photos"
                    onClick={() => {
                      handleSecondaryImageClick(index);
                    }}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </WrapSecondaryImages>
        </WrapAllImages>

        <TextWrap
          $pageFavorites={pathname === `/my-account/favorite/${product?._id}`}
        >
          <WrapInformation
            $pageFavorites={pathname === `/my-account/favorite/${product?._id}`}
          >
            <Wrap
              $pageFavorites={
                pathname === `/my-account/favorite/${product?._id}`
              }
            >
              <Title>{product?.name}</Title>
              <WrapInside>
                <TextSeller>
                  {t('seller')}: <span>{product?.owner?.nickname}</span>
                </TextSeller>
              </WrapInside>
            </Wrap>
            <TextSize>
              {t('size')}:{' '}
              <TextValueSize>
                {product?.size || product?.childSize}
              </TextValueSize>
            </TextSize>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              {product?.rental && (
                <SecondWrap>
                  <Price style={{ width: 'max-content' }}>{t('rental')}</Price>
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
                  <Price style={{ width: 'max-content', marginLeft: 'auto' }}>
                    {t('sale')}
                  </Price>
                  <TextPrice style={{ textAlign: 'end' }}>
                    {product.salePrice} Kč
                  </TextPrice>
                </SecondWrap>
              )}
            </div>
            {product?.rental && (
              <WrapCalendar>
                <ButtonCalendarTime>
                  <IconCalendarTime />
                </ButtonCalendarTime>
                <TextCalendar>{t('Rental calendar')}</TextCalendar>
              </WrapCalendar>
            )}
            <WrapBtn>
              {pathname !== `/my-account/favorite/${product?._id}` && (
                <IconChat />
              )}
              <Button
                disabled={product?.owner?._id === user?.userID}
                style={{ width: 'auto' }}
                onClick={() => {
                  api.addToOrder({
                    productId: product._id,
                    serviceType: 'rent',
                    price: product?.dailyRentalPrice || product?.rentalPrice,
                    owner: product?.owner?._id,
                  });
                }}
              >
                Орендувати
              </Button>
              <Button
                disabled={product?.owner?._id === user?.userID}
                style={{ width: 'auto' }}
                onClick={() => {
                  api.addToOrder({
                    productId: product?._id,
                    serviceType: 'buy',
                    price: product?.salePrice,
                    owner: product?.owner?._id,
                  });
                }}
              >
                Купити
              </Button>
              {pathname !== `/my-account/favorite/${product?._id}` && (
                <ButtonAddToFavorite
                  onClick={e => {
                    e.preventDefault();
                    handleAddToFavorites(product?._id);
                  }}
                >
                  <IconHeart
                    fill={
                      user?.favorites.includes(product?._id)
                        ? '#000'
                        : 'transparent'
                    }
                  />
                </ButtonAddToFavorite>
              )}
              <IconChat />
            </WrapBtn>
          </WrapInformation>

          <WrapDescription>
            <Border />
            <TitleDescription>{t('Product Description')}</TitleDescription>
            <TextDescription>{product?.description}</TextDescription>
            <TitleDescription
              style={{
                marginTop: '24px',
              }}
            >
              {t('color')}
            </TitleDescription>
            <WrapColor>
              <Color
                style={{
                  backgroundColor: product?.colorCode,
                }}
              />
              <TextDescription>{t(product?.color)}</TextDescription>
            </WrapColor>
          </WrapDescription>
        </TextWrap>
      </WrapProductCard>
      <WrapReviews
        $pageFavorites={pathname === `/my-account/favorite/${product?._id}`}
      >
        <Title>{t('reviews')}</Title>
        <ListReviews>
          <ItemReview>
            <WrapPerson>
              <PicturePerson>
                <ImagesPerson srcSet={`${Avatar}`} alt="Гардероб" />
              </PicturePerson>
              <TitleName>Приходько Оксана</TitleName>
            </WrapPerson>
            <WrapPersonInfo>
              <WrapInfo>
                <WrapIconsStars>
                  <IconStar />
                  <IconStar />
                  <IconStar />
                  <IconStar />
                  <IconStar />
                </WrapIconsStars>
                <WrapTimeRent>
                  <TextRent>{t('Rental completed')}:</TextRent>
                  <TextRentValue>01.01.2024 - 15.01.2024</TextRentValue>
                </WrapTimeRent>
              </WrapInfo>
              <TextReview>Дуже гарна сукня, дякую вам!</TextReview>
            </WrapPersonInfo>
          </ItemReview>
        </ListReviews>
        <ButtonPreview>{t('Leave a review')}</ButtonPreview>
      </WrapReviews>
    </GeneralWrap>
  );
};

export default ProductPage;
