import { Container } from 'components/Container/Container';
import NavigationOverlay from 'components/NavigationOverlay/NavigationOverlay';
import { useParams } from 'react-router-dom';
import {
  Border,
  Color,
  ImagesPerson,
  ItemDescription,
  ItemReview,
  ListDescription,
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
// import MainImageCard from '../../images/big-photo-product-card.jpg';
import SecondaryImage1 from '../../images/product-card-1.jpg';
import SecondaryImage2 from '../../images/product-card-2.jpg';
import SecondaryImage3 from '../../images/product-card-3.jpg';
import IconHeart from 'images/icons/IconHeart';
import { useTranslation } from 'react-i18next';
import Avatar from 'images/photo-ready-woman/photo-ready-mobile-1x.jpg';
import IconStar from 'images/icons/IconStart';
import Button from 'components/Button/Button';
import IconCalendarTime from 'images/icons/IconCalendarTime';
// import AliceCarousel from 'react-alice-carousel';
import 'react-alice-carousel/lib/alice-carousel.css';
import { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Scrollbar, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/scrollbar';
import 'swiper/css/navigation';

const secondaryImages = [
  SecondaryImage1,
  SecondaryImage2,
  SecondaryImage3,
  SecondaryImage1,
  SecondaryImage2,
  SecondaryImage3,
];

const ProductPage = () => {
  // const swiperRef = useRef(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { id } = useParams();
  console.log('id', id);

  const handleSecondaryImageClick = index => {
    setCurrentImageIndex(index);
    // swiperRef.current.slideTo(index);
  };

  const { t } = useTranslation('translation', {
    keyPrefix: 'pages.productPage',
  });

  const width = window.innerWidth < 767;
  return (
    <Container>
      <NavigationOverlay />
      <GeneralWrap>
        <WrapProductCard>
          <WrapAllImages>
            <MainImage
              srcSet={secondaryImages[currentImageIndex] || secondaryImages[0]}
              alt="Main photo"
            />

            <WrapSecondaryImages>
              <List>
                <Swiper
                  // ref={swiperRef}
                  modules={[Scrollbar, Navigation]}
                  spaceBetween={8}
                  slidesPerView={3}
                  scrollbar={{ draggable: true }}
                  direction={width ? 'horizontal' : 'vertical'}
                >
                  {secondaryImages.map((image, index) => (
                    <SwiperSlide key={index}>
                      <SecondaryImages
                        srcSet={image}
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
                <Title>HOUSE OF THE BREND</Title>
                <WrapInside>
                  <TextSale>{t('sale')}</TextSale>
                  <TextSeller>
                    {t('seller')}: <span>ann_25</span>
                  </TextSeller>
                </WrapInside>
              </Wrap>
              <TextSize>
                {t('size')}:<TextValueSize>XXXL</TextValueSize>
              </TextSize>
              <TextPrice>
                100 <span>CZK</span>
              </TextPrice>
              <WrapCalendar>
                <ButtonCalendarTime>
                  <IconCalendarTime />
                </ButtonCalendarTime>
                <TextCalendar>{t('Rental calendar')}</TextCalendar>
              </WrapCalendar>
              <WrapBtn>
                <Button>{t('addToCart')}</Button>
                <IconHeart />
              </WrapBtn>
            </WrapInformation>

            <WrapDescription>
              <Border />
              <TitleDescription>{t('Product Description')}</TitleDescription>

              <ListDescription>
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
                    Довжина 145 см, одягається на запах, перетинками по ліфу
                    можна регулювати декольте.
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
              </ListDescription>
              <TitleDescription>{t('color')}</TitleDescription>
              <WrapColor>
                <Color />
                <TextDescription>{t('black')}</TextDescription>
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
    </Container>
  );
};

export default ProductPage;
