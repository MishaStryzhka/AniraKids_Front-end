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

const RentalCard = ({ order }) => {
  console.log('order', order);
  console.log('first', order?.items[0].product.photos[0].path);

  const { t } = useTranslation('translation', {
    keyPrefix: 'components.rentalCard',
  });
  return (
    <WrapCard>
      <PictureTablet>
        <Image
          src={order?.items[0]?.product?.photos[0]?.path}
          alt="Фотографія продукту"
        />
      </PictureTablet>
      <AddWrap>
        <Wrap>
          <Picture>
            {/* <Image src={order?.photos[0]?.path} alt="Фотографія продукту" /> */}
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
                <TextRentalTime>{order.rentalPeriods}</TextRentalTime>
              </SecondWrap>
            </WrapTime>
            <TextOrder>
              {t('order')}
              <span style={{ marginLeft: '6px' }}>ID:{order._id}</span>
            </TextOrder>
          </WrapTimeRent>
        </Wrap>

        <WrapText>
          <div>
            <TextName>{order.name}</TextName>
            <TextSeller>
              {t('Seller')}:
              <span style={{ marginLeft: '8px' }}>{order.owner.nickname}</span>
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
