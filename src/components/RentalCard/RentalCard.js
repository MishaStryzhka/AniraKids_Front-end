import { useTranslation } from 'react-i18next';
import {
  AddWrap,
  FirstWrap,
  Image,
  NavLinkMessage,
  Picture,
  PictureTablet,
  SecondWrap,
  StyledIconSuccessClock,
  TextMessage,
  TextName,
  TextOrder,
  TextRental,
  TextRentalTime,
  TextSeller,
  Wrap,
  WrapButton,
  WrapButtonTablet,
  WrapCard,
  WrapText,
  WrapTime,
  WrapTimeRent,
} from './RentalCard.styled';
import ButtonBack from 'components/Buttons/ButtonBack/ButtonBack';
import IconChats from 'images/icons/IconChats';

const RentalCard = ({ product }) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.rentalCard',
  });
  return (
    <WrapCard>
      <PictureTablet>
        <Image src={product?.photos[0]?.path} alt="Фотографія продукту" />
      </PictureTablet>
      <AddWrap>
        <Wrap>
          <Picture>
            <Image src={product?.photos[0]?.path} alt="Фотографія продукту" />
          </Picture>

          <WrapTimeRent>
            <WrapTime>
              <FirstWrap>
                <StyledIconSuccessClock />
                {window.innerWidth < 768 && (
                  <TextRental>{t('rent')}:</TextRental>
                )}
              </FirstWrap>
              <SecondWrap>
                {window.innerWidth > 768 && (
                  <TextRental>{t('rent')}:</TextRental>
                )}
                <TextRentalTime>01.03.2024 - 12.03.2024</TextRentalTime>
              </SecondWrap>
            </WrapTime>
            <TextOrder>
              {t('order')}
              <span style={{ marginLeft: '6px' }}>N123456789</span>
            </TextOrder>
          </WrapTimeRent>
        </Wrap>

        <WrapText>
          <div>
            <TextName>{product.name}</TextName>
            <TextSeller>
              {t('Seller')}:
              <span style={{ marginLeft: '8px' }}>
                {product.owner.nickname}
              </span>
            </TextSeller>
            <NavLinkMessage to="../chat">
              <IconChats />
              <TextMessage>{t('Write to the seller')}</TextMessage>
            </NavLinkMessage>
          </div>
          <WrapButtonTablet>
            <ButtonBack>{t('return')}</ButtonBack>
          </WrapButtonTablet>
        </WrapText>
        <WrapButton>
          <ButtonBack>{t('return')}</ButtonBack>
        </WrapButton>
      </AddWrap>
    </WrapCard>
  );
};

export default RentalCard;
