import { Container } from 'components/Container/Container';
import NavigationOverlay from 'components/NavigationOverlay/NavigationOverlay';
import { useParams } from 'react-router-dom';
import {
  Border,
  Color,
  ItemDescription,
  ListDescription,
  MainImage,
  SecondaryImages,
  TextDescription,
  TextPrice,
  TextSale,
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
  WrapProductCard,
  WrapSecondaryImages,
} from './ProductPage.styled';
import MainImageCard from '../../images/big-photo-product-card.jpg';
import SecondaryImage1 from '../../images/product-card-1.jpg';
import SecondaryImage2 from '../../images/product-card-2.jpg';
import SecondaryImage3 from '../../images/product-card-3.jpg';
import Button from 'components/Button/Button';
import IconHeart from 'images/icons/IconHeart';
import { useTranslation } from 'react-i18next';

const ProductPage = () => {
  const { id } = useParams();
  console.log('id', id);

  const { t } = useTranslation('translation', {
    keyPrefix: 'pages.productPage',
  });
  return (
    <Container>
      <NavigationOverlay />
      <WrapProductCard>
        <WrapAllImages>
          <MainImage srcSet={MainImageCard} alt="frame" />

          <WrapSecondaryImages>
            <SecondaryImages srcSet={SecondaryImage1} alt="frame" />

            <SecondaryImages srcSet={SecondaryImage2} alt="frame" />

            <SecondaryImages srcSet={SecondaryImage3} alt="frame" />
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
              100
              <span>$</span>
            </TextPrice>
            <WrapBtn>
              <Button>{t('addToCart')}</Button>
              <IconHeart />
            </WrapBtn>
          </WrapInformation>
          <Border />
          <WrapDescription>
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
            </ListDescription>
            <TitleDescription>{t('color')}</TitleDescription>
            <WrapColor>
              <Color />
              <TextDescription>{t('black')}</TextDescription>
            </WrapColor>
          </WrapDescription>
        </TextWrap>
      </WrapProductCard>
    </Container>
  );
};

export default ProductPage;
