import { useNavigate, useLocation, useParams } from 'react-router-dom';
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
  StyledButton,
} from './ProductPage.styled';
import { useTranslation } from 'react-i18next';
import Avatar from 'images/photo-ready-woman/photo-ready-mobile-1x.jpg';
import IconStar from 'images/icons/IconStart';
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
import { useAuth, useStorage } from 'hooks';
import IconLittleHeart from 'images/icons/IconLittleHeart';
import theme from 'components/theme';
import { usePageMeta } from 'hooks/usePageMeta';
import { arrayColorsProduct } from 'data';
import Modal from 'components/Modals/Modal';
import { GeneralModalWindow } from 'components/Modals/Modal.styled';
import ModalConfirm from 'components/Modals/ModalConfirm/ModalConfirm';
import CalendarSelectDate from 'components/Calendar/CalendarSelectDate';

const api = require('../../api');

const ProductPage = () => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'pages.productPage',
  });
  const { user, currentTheme } = useAuth();
  const { id } = useParams();
  const { pathname, state } = useLocation();
  const [rentalPeriods, setRentalPeriods] = useState(state?.rentalPeriods);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [product, setProduct] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpenModalRent, setIsOpenModalRent] = useState(false);
  const [isOpenModalSelectDateRent, setIsOpenModalSelectDateRent] =
    useState(false);
  // eslint-disable-next-line no-unused-vars
  const [error, setError] = useState();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const storage = useStorage();
  const [favorites, setFavorites] = useState(
    user?.favorites || storage.get('favorites') || []
  );
  usePageMeta(product._id);

  useEffect(() => {
    user?.favorites && setFavorites(user?.favorites);
  }, [user?.favorites]);

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

  const handleAddToFavorites = id => {
    if (user) {
      user?.favorites?.includes(id)
        ? dispatch(removeFromFavorites(id))
        : dispatch(addToFavorites(id));
    } else {
      if (storage.get('favorites')?.includes(id)) {
        storage.set(
          'favorites',
          storage.get('favorites').filter(favorite => favorite !== id)
        );
        setFavorites(prevFavorites =>
          prevFavorites.filter(favorite => favorite !== id)
        );
      } else {
        storage.set('favorites', [...storage.get('favorites'), id]);
        setFavorites(prevFavorites => [...prevFavorites, id]);
      }
    }
  };

  const handleSecondaryImageClick = index => {
    setCurrentImageIndex(index);
    // swiperRef.current.slideTo(index);
  };

  const handleClickRent = e => {
    console.log('qwe');
    rentalPeriods
      ? setIsOpenModalRent(true)
      : setIsOpenModalSelectDateRent(true);
  };

  const handleClickBuy = e => {
    setIsLoading(true);
    api
      .addToOrder({
        productId: product?._id,
        serviceType: 'buy',
        price: product?.salePrice,
        owner: product?.owner?._id,
      })
      .then(data => {
        setIsLoading(false);
        navigate('/my-account/cart');
      });
  };

  const width = window.innerWidth < 767;
  const colorProduct = arrayColorsProduct.find(
    item => item.color === product?.color
  );

  return isLoading ? (
    <p>Loading...</p>
  ) : (
    <>
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
              $pageFavorites={
                pathname === `/my-account/favorite/${product?._id}`
              }
            >
              <Wrap
              // $pageFavorites={
              //   pathname === `/my-account/favorite/${product?._id}`
              // }
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
                    <Price style={{ width: 'max-content' }}>
                      {t('rental')}
                    </Price>
                    <div>
                      {product.dailyRentalPrice && (
                        <TextPrice>{product.dailyRentalPrice} kč/den</TextPrice>
                      )}
                      {product.hourlyRentalPrice && (
                        <TextPrice>
                          {product.hourlyRentalPrice} Kč/hod
                        </TextPrice>
                      )}
                      {product.rentalPrice && (
                        <TextPrice>{product.rentalPrice} kč/den</TextPrice>
                      )}
                    </div>
                  </SecondWrap>
                )}
                {product?.sale && (
                  <SecondWrap>
                    <Price
                    // style={{ width: 'max-content', marginLeft: 'auto' }}
                    >
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
                {(product?.dailyRentalPrice ||
                  product?.hourlyRentalPrice ||
                  product?.rentalPrice) && (
                  <StyledButton
                    // disabled={product?.owner?._id === user?.userID}
                    onClick={handleClickRent}
                    ariaLabel="rent"
                  >
                    Орендувати
                  </StyledButton>
                )}
                {product?.salePrice && (
                  <StyledButton
                    // disabled={product?.owner?._id === user?.userID}
                    onClick={handleClickBuy}
                    ariaLabel="buy"
                  >
                    Купити
                  </StyledButton>
                )}
                {pathname !== `/my-account/favorite/${product?._id}` && (
                  <ButtonAddToFavorite
                    onClick={e => {
                      e.preventDefault();
                      handleAddToFavorites(product?._id);
                    }}
                  >
                    <IconLittleHeart
                      width={24}
                      height={24}
                      fill={
                        favorites?.includes(product?._id)
                          ? theme[currentTheme].color.mainColor3
                          : '#fff'
                      }
                      stroke={theme[currentTheme].color.mainColor3}
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
                    backgroundColor: colorProduct.colorCode,
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
      {isOpenModalRent && (
        <ModalConfirm
          onCloseModal={() => setIsOpenModalRent(false)}
          confirm={() => {
            setIsLoading(true);
            api
              .addToOrder({
                productId: product._id,
                serviceType: 'rent',
                price:
                  product?.dailyRentalPrice ||
                  product?.hourlyRentalPrice ||
                  product?.rentalPrice,
                owner: product?.owner?._id,
                rentalPeriods,
              })
              .then(data => {
                setIsLoading(false);
                navigate('/my-account/cart');
              });
          }}
          onClickDisagree={() => {
            setIsOpenModalRent(false);
            setIsOpenModalSelectDateRent(true);
          }}
          title={`Орендувати продукт
              ${
                rentalPeriods.split('-').length > 1
                  ? `з ${rentalPeriods.split('-')[0]} по ${
                      rentalPeriods.split('-')[1]
                    }`
                  : `на ${rentalPeriods}`
              }`}
          titleButtonDisagree={'Ні, вибрати іншу дату'}
        />
      )}
      {isOpenModalSelectDateRent && (
        <Modal onCloseModal={() => setIsOpenModalSelectDateRent(false)}>
          <GeneralModalWindow>
            <CalendarSelectDate
              rentalPeriods={rentalPeriods}
              setRentalPeriods={setRentalPeriods}
              saveSelectedDate={() => {
                setIsLoading(true);
                api
                  .addToOrder({
                    productId: product._id,
                    serviceType: 'rent',
                    price:
                      product?.dailyRentalPrice ||
                      product?.hourlyRentalPrice ||
                      product?.rentalPrice,
                    owner: product?.owner?._id,
                    rentalPeriods,
                  })
                  .then(data => {
                    setIsLoading(false);
                    navigate('/my-account/cart');
                    document.body.style.overflow = 'auto';
                  });
              }}
            />
          </GeneralModalWindow>
        </Modal>
      )}
    </>
  );
};

export default ProductPage;
