import { useNavigate, useLocation, useParams } from 'react-router-dom';
import {
  Border,
  Color,
  TextDescription,
  TextPrice,
  TextSeller,
  TextSize,
  TextValueSize,
  TextWrap,
  Title,
  TitleDescription,
  Wrap,
  WrapAllImages,
  WrapBtn,
  WrapColor,
  WrapDescription,
  WrapInformation,
  WrapInside,
  WrapSecondaryImages,
  WrapCalendar,
  TextCalendar,
  ButtonCalendarTime,
  GeneralWrap,
  ButtonAddToFavorite,
  StyledButton,
  Image,
  StyledSwiper,
  StyledSecondSwiper,
  SecondImage,
  WrapProduct,
} from './ProductPage.styled';
import { useTranslation } from 'react-i18next';
import IconCalendarTime from 'images/icons/IconCalendarTime';
import 'react-alice-carousel/lib/alice-carousel.css';
import { useContext, useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import {
  Navigation,
  FreeMode,
  Thumbs,
  Pagination,
  Mousewheel,
} from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/scrollbar';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
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
import { ModalAuthContext } from 'components/App';
import SceletonProductPage from './SceletonProductPage';
import { addOrderIdToUserCart } from '../../redux/auth/slice';

const api = require('../../api');

const ProductPage = () => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'pages.productPage',
  });
  const { user, currentTheme } = useAuth();
  const { id } = useParams();
  const { pathname, state } = useLocation();
  const [rentalPeriods, setRentalPeriods] = useState(state?.rentalPeriods);

  const sessionStorage = useStorage('typeRent', 'session');
  const [typeRent, setTypeRent] = useState(
    sessionStorage.get('typeRent') || 'celebration'
  ); // 'celebration' , 'photosession'

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [product, setProduct] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [isOpenModalRent, setIsOpenModalRent] = useState(false);
  const [isOpenModalSelectDateRent, setIsOpenModalSelectDateRent] =
    useState(false);
  const { setIsOpenModalAuth } = useContext(ModalAuthContext);
  // eslint-disable-next-line no-unused-vars
  const [error, setError] = useState();
  const storage = useStorage();
  const [favorites, setFavorites] = useState(
    user?.favorites || storage.get('favorites') || []
  );
  usePageMeta(product._id);

  useEffect(() => {
    user?.favorites && setFavorites(user?.favorites);
  }, [user?.favorites]);

  useEffect(() => {
    api
      .getProductById(id)
      .then(data => {
        setProduct(data.product);
        setIsLoadingPage(false);
      })
      .catch(error => {
        setError(error);
        setIsLoadingPage(false);
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

  const handleClickRent = e => {
    !user
      ? setIsOpenModalAuth(true)
      : rentalPeriods
      ? setIsOpenModalRent(true)
      : setIsOpenModalSelectDateRent(true);
  };

  const handleClickBuy = e => {
    setIsLoading(true);
    api
      .addToOrder({
        productId: product?._id,
        serviceType: 'buy',
        price: { salePrice: product?.salePrice },
        owner: product?.owner?._id,
      })
      .then(({ currentOrder }) => {
        dispatch(addOrderIdToUserCart(currentOrder._id));

        setIsLoading(false);
        navigate(`/my-account/cart#${currentOrder._id}`);
      });
  };

  const width = window.innerWidth < 767;
  const colorProduct = arrayColorsProduct.find(
    item => item.color === product?.color
  );
  const [thumbsSwiper, setThumbsSwiper] = useState(null);

  useEffect(() => {
    document.body.style.overflow = 'auto';
  }, [user]);

  return isLoadingPage ? (
    <SceletonProductPage />
  ) : (
    <>
      <GeneralWrap>
        <WrapProduct $column={pathname.includes('my-account')}>
          <WrapAllImages>
            <StyledSwiper>
              <Swiper
                style={{
                  '--swiper-navigation-color': '#fff',
                  '--swiper-pagination-color': '#fff',
                }}
                spaceBetween={10}
                navigation={true}
                thumbs={{ swiper: thumbsSwiper }}
                modules={[FreeMode, Navigation, Thumbs]}
              >
                {product?.photos.map(({ path }, index) => (
                  <SwiperSlide key={index}>
                    <Image
                      src={path}
                      style={{ objectFit: 'cover' }}
                      aria-label="imageProduct"
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            </StyledSwiper>
            <WrapSecondaryImages>
              <StyledSecondSwiper>
                <Swiper
                  onSwiper={setThumbsSwiper}
                  style={{
                    '--swiper-navigation-color': '#fff',
                    '--swiper-pagination-color': '#fff',
                  }}
                  direction={width ? 'horizontal' : 'vertical'}
                  slidesPerView={3}
                  spaceBetween={8}
                  mousewheel={true}
                  pagination={{
                    clickable: true,
                  }}
                  modules={[Mousewheel, Pagination]}
                  className="mySwiper"
                >
                  {product?.photos.map(({ path }, index) => (
                    <SwiperSlide key={index}>
                      <SecondImage src={path} aria-label="imageProduct" />
                    </SwiperSlide>
                  ))}
                </Swiper>
              </StyledSecondSwiper>
            </WrapSecondaryImages>
          </WrapAllImages>

          <TextWrap $pageMyAccount={pathname.includes('my-account')}>
            <WrapInformation $pageMyAccount={pathname.includes('my-account')}>
              <Wrap>
                <Title>{product?.name}</Title>
                <WrapInside>
                  <TextSeller>
                    {t('seller')}: <span>{product?.owner?.nickname}</span>
                  </TextSeller>
                </WrapInside>
              </Wrap>
              <TextSize>
                {t('size')}:
                <TextValueSize>
                  {product?.size || product?.childSize}
                </TextValueSize>
              </TextSize>
              <div style={{ display: 'flex', justifyContent: 'space-around' }}>
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
              {product.deposit && (
                <div
                  style={{ display: 'flex', justifyContent: 'space-around' }}
                >
                  <SecondWrap>
                    <Price style={{ width: 'max-content' }}>
                      {t('deposit')}
                    </Price>
                    <div>
                      <TextPrice>{product.deposit} kč</TextPrice>
                    </div>
                  </SecondWrap>
                </div>
              )}
              {pathname !== `/my-account/rent-out/${product?._id}` &&
                product?.rental && (
                  <WrapCalendar>
                    <ButtonCalendarTime>
                      <IconCalendarTime />
                    </ButtonCalendarTime>
                    <TextCalendar>{t('Rental calendar')}</TextCalendar>
                  </WrapCalendar>
                )}
              {pathname !== `/my-account/rent-out/${product?._id}` && (
                <WrapBtn>
                  {(product?.dailyRentalPrice ||
                    product?.hourlyRentalPrice ||
                    product?.rentalPrice) && (
                    <StyledButton
                      // disabled={product?.owner?._id === user?.userID}
                      onClick={handleClickRent}
                      ariaLabel="rent"
                    >
                      {t('rent')}
                    </StyledButton>
                  )}
                  {product?.salePrice && (
                    <StyledButton
                      // disabled={product?.owner?._id === user?.userID}
                      onClick={handleClickBuy}
                      ariaLabel="buy"
                    >
                      {t('buy')}
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
              )}
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
        </WrapProduct>
        {/* <WrapReviews
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
        </WrapReviews> */}
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
                price: {
                  dailyRentalPrice: product?.dailyRentalPrice,
                  hourlyRentalPrice: product?.hourlyRentalPrice,
                  deposit: product?.deposit,
                },
                owner: product?.owner?._id,
                rentalPeriods,
                typeRent,
                pickupAddress: product?.pickupAddress,
              })
              .then(({ currentOrder }) => {
                document.body.style.overflow = 'auto';
                dispatch(addOrderIdToUserCart(currentOrder._id));

                setIsLoading(false);

                navigate(`/my-account/cart#${currentOrder._id}`);
              })
              .catch(({ response: { data, status } }) => {
                setIsLoading(false);
                document.body.style.overflow = 'auto';
                if (status === 409) {
                  navigate(`/my-account/cart#${data.orderId}`);
                }
              });
          }}
          onClickDisagree={() => {
            setIsOpenModalRent(false);
            setIsOpenModalSelectDateRent(true);
          }}
          title={
            rentalPeriods.split('-').length > 1
              ? t('rentProductFromTo', {
                  from: rentalPeriods.split('-')[0],
                  to: rentalPeriods.split('-')[1],
                })
              : t('rentProductFor', { date: rentalPeriods })
          }
          titleButtonDisagree={t('No, choose another date')}
        />
      )}
      {isOpenModalSelectDateRent && (
        <Modal closeModal={() => setIsOpenModalSelectDateRent(false)}>
          <GeneralModalWindow style={{ width: 360, boxSizing: 'border-box' }}>
            <CalendarSelectDate
              rentalPeriods={rentalPeriods}
              setRentalPeriods={setRentalPeriods}
              typeRent={typeRent}
              setTypeRent={setTypeRent}
              saveSelectedDate={() => {
                setIsLoading(true);
                api
                  .addToOrder({
                    productId: product._id,
                    serviceType: 'rent',
                    price: {
                      dailyRentalPrice: product?.dailyRentalPrice,
                      hourlyRentalPrice: product?.hourlyRentalPrice,
                      deposit: product?.deposit,
                    },
                    owner: product?.owner?._id,
                    rentalPeriods,
                    typeRent,
                    pickupAddress: product?.pickupAddress,
                  })
                  .then(({ currentOrder }) => {
                    document.body.style.overflow = 'auto';
                    dispatch(addOrderIdToUserCart(currentOrder._id));

                    setIsLoading(false);
                    setIsOpenModalSelectDateRent(false);
                    navigate(`/my-account/cart#${currentOrder._id}`);
                  })
                  .catch(({ response: { data, status } }) => {
                    setIsLoading(false);
                    document.body.style.overflow = 'auto';
                    if (status === 409) {
                      navigate(`/my-account/cart#${data.orderId}`);
                    }
                    console.log('error');
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
