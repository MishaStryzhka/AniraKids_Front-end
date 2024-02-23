import { useParams } from 'react-router-dom';
import {
  Border,
  Color,
  ImagesPerson,
  // ItemDescription,
  ItemReview,
  // ListDescription,
  ListReviews,
  MainImage,
  PicturePerson,
  SecondaryImages,
  TextDescription,
  TextPrice,
  TextRent,
  TextRentValue,
  TextReview,
  TextSale,
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
  List,
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

const api = require('../../api/product');

const ProductPage = index => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'pages.productPage',
  });
  // const swiperRef = useRef(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { id } = useParams();

  const handleSecondaryImageClick = index => {
    setCurrentImageIndex(index);
    // swiperRef.current.slideTo(index);
  };

  const [product, setProduct] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  // eslint-disable-next-line no-unused-vars
  const [error, setError] = useState();

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

  const width = window.innerWidth < 767;
  return isLoading ? (
    <p>Loading...</p>
  ) : (
    <GeneralWrap>
      <WrapProductCard>
        <WrapAllImages>
          <MainImage
            srcSet={product?.photos[currentImageIndex].path}
            alt="Main photo"
          />

          <WrapSecondaryImages>
            <List>
              <Swiper
                modules={[Scrollbar, Navigation]}
                spaceBetween={8}
                slidesPerView={3}
                scrollbar={{ draggable: true }}
                direction={width ? 'horizontal' : 'vertical'}
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
            </List>
          </WrapSecondaryImages>
        </WrapAllImages>

        <TextWrap>
          <WrapInformation>
            <Wrap>
              <Title>{product?.name}</Title>
              <WrapInside>
                {product?.rental ? (
                  <TextSale>{t('rental')}</TextSale>
                ) : (
                  product?.sale && <TextSale>{t('sale')}</TextSale>
                )}

                <TextSeller>
                  {t('seller')}: <span>{product?.owner?.nickname}</span>
                </TextSeller>
              </WrapInside>
            </Wrap>
            <TextSize>
              {t('size')}: <TextValueSize>{product?.size}</TextValueSize>
            </TextSize>
            {product?.rentalPrice && (
              <TextPrice>
                {product?.rentalPrice}
                <span>CZK</span>
              </TextPrice>
            )}
            {product?.salePrice && (
              <TextPrice>
                {product?.salePrice}
                <span>CZK</span>
              </TextPrice>
            )}
            {product?.rental && (
              <WrapCalendar>
                <ButtonCalendarTime>
                  <IconCalendarTime />
                </ButtonCalendarTime>
                <TextCalendar>{t('Rental calendar')}</TextCalendar>
              </WrapCalendar>
            )}
            <WrapBtn>
              <Button>{t('addToCart')}</Button>
              <IconHeart />
              <IconChat />
            </WrapBtn>
          </WrapInformation>

          <WrapDescription>
            <Border />
            <TitleDescription>{t('Product Description')}</TitleDescription>
            <TextDescription>{product.description}</TextDescription>
            {/* <ListDescription>
              <ItemDescription>
                <TextDescription>Сукня Довга</TextDescription>
              </ItemDescription>
              <ItemDescription>
                <TextDescription>Арт 05706.4*15</TextDescription>
              </ItemDescription>
              <ItemDescription>
                <TextDescription>
                  Матеріал - щильний шовк, перед і рукава - дороге італійське
                  мереживо: вишивка на сітки з легким блиском.
                </TextDescription>
              </ItemDescription>
              <ItemDescription>
                <TextDescription>
                  Довжина 145 см, одягається на запах, перетинками по ліфу можна
                  регулювати декольте.
                </TextDescription>
              </ItemDescription>
              <ItemDescription>
                <TextDescription>
                  48-52 - на ОГ 96-105, ОБ до 125
                </TextDescription>
              </ItemDescription>
              <ItemDescription>
                <TextDescription>
                  54-58- на ОГ 107-118, ОБ до 135
                </TextDescription>
              </ItemDescription>
              <ItemDescription>
                <TextDescription>
                  60-64 - на ОГ 120- 130, ОБ до 150
                </TextDescription>
              </ItemDescription>
              <ItemDescription>
                <TextDescription>
                  66-70- на ОГ 132-142, ОБ до 170
                </TextDescription>
              </ItemDescription>
            </ListDescription> */}
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
              <TextDescription>{t(product.color)}</TextDescription>
            </WrapColor>
          </WrapDescription>
        </TextWrap>
      </WrapProductCard>
      <WrapReviews>
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
