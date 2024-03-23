import { useTranslation } from 'react-i18next';
import { useLocation, useParams } from 'react-router-dom';
import {
  GeneralText,
  MainWrap,
  StyledIconLongArrow,
  StyledNavLink,
  Text,
  WrapFirst,
  WrapInfoSeller,
  WrapInfoDelivery,
  WrapInfoPay,
  Title,
  WrapTextSeller,
  WrapIconsStars,
  TextRating,
  UserNickname,
  WrapPartSeller,
  PictureSeller,
  ImageSeller,
  MainWrapText,
  DescriptionSeller,
  StyledIconBag,
  MessageSeller,
  InnerWrap,
  Wrap,
  TextPayment,
} from './ViewOrderProduct.styled';
// import OrderCard from 'components/OrderCard/OrderCard';
import RatingStars from 'components/RatingStars/RatingStars';
import { useEffect, useState } from 'react';
import IconTime from 'images/icons/IconTime';
import OrderCard from 'components/OrderCard/OrderCard';
import IconChats from 'images/icons/IconChats';
import IconPerson from 'images/icons/IconPerson';
import IconLocation from 'images/icons/IconLocation';
import IconPhone from 'images/icons/IconPhone';
import IconCar from 'images/icons/IconCar';
import IconCard from 'images/icons/IconCard';
const api = require('../../api');

const ViewOrderProduct = () => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.viewOrderProduct',
  });
  const { id } = useParams();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [order, setOrder] = useState(null);
  console.log(isLoading);
  useEffect(() => {
    setIsLoading(true);
    api
      .getProducts()
      .then(data => {
        console.log(data);
        console.log(data.products);
        const findOrder = data.products.find(product => product._id === id);
        setOrder(findOrder);
        setIsLoading(false);
      })
      .catch(error => {
        setIsLoading(false);
      });
  }, [id]);

  console.log(order);
  return (
    <>
      {location.pathname === `/my-account/my-orders/order/${id}` && (
        <StyledNavLink to={location.state}>
          <StyledIconLongArrow />
          {t('toBackOrders')}
        </StyledNavLink>
      )}
      {location.pathname === `/my-account/my-purchases/purchase/${id}` && (
        <StyledNavLink to={location.state}>
          <StyledIconLongArrow />
          {t('toBackPurchases')}
        </StyledNavLink>
      )}
      <MainWrap>
        <OrderCard product={order} />
        <WrapFirst>
          <Text>
            {t('Order total')}:<span style={{ fontWeight: 400 }}>2500 kč</span>
          </Text>
          <Text>
            {t('Shipping')}:<span style={{ fontWeight: 400 }}>2500 kč</span>
          </Text>
          <GeneralText>
            {t('Total amount')}
            <span>3000 kč</span>
          </GeneralText>
        </WrapFirst>
        {/* SELLER */}
        <WrapInfoSeller>
          <Title>{t('seller')}</Title>
          <WrapPartSeller>
            <PictureSeller>
              <ImageSeller src={order?.owner?.avatar} alt="Photo avatar" />
            </PictureSeller>
            <MainWrapText>
              <div>
                <WrapTextSeller>
                  <WrapIconsStars>
                    <RatingStars rating={order?.owner?.rating || 5} />
                  </WrapIconsStars>
                  <TextRating>
                    {order?.owner?.rating?.toFixed(1) || '5.0'}
                    {order?.owner?.ratingCount > 0 &&
                      `(${order?.owner?.ratingCount} ${t('ratings')})`}
                  </TextRating>
                </WrapTextSeller>
                <UserNickname>{order?.owner?.nickname}</UserNickname>
              </div>
              <div>
                <DescriptionSeller style={{ marginBottom: '8px' }}>
                  <StyledIconBag /> 100% {t('completed orders')}
                </DescriptionSeller>
                <DescriptionSeller>
                  <IconTime />
                  {t('responds within 12 hours')}
                </DescriptionSeller>
              </div>
              <MessageSeller>
                <IconChats />
                {t('Write to the seller')}
              </MessageSeller>
            </MainWrapText>
          </WrapPartSeller>
        </WrapInfoSeller>
        <WrapInfoDelivery>
          <Title>{t('Shipping information')}</Title>
          <InnerWrap>
            <IconPerson />
            <Wrap>
              <Text>{t('Recipient')}:</Text>
              <Text style={{ fontWeight: 400 }}>Бондаренко О.О.</Text>
            </Wrap>
          </InnerWrap>
          <InnerWrap>
            <IconLocation />
            <Wrap>
              <Text>{t('Address')}:</Text>
              <Text style={{ fontWeight: 400 }}>{t('City')}: Київ</Text>
              <Text style={{ fontWeight: 400 }}>
                {t('Street')}: Лесі Українки 21А
              </Text>
            </Wrap>
          </InnerWrap>
          <InnerWrap>
            <IconCar />
            <Wrap>
              <Text>{t('Delivery')}:</Text>
              <Text style={{ fontWeight: 400 }}>{t('Delivery service')}: </Text>
              <Text style={{ fontWeight: 400 }}>{t('Delivery type')}: </Text>
            </Wrap>
          </InnerWrap>
          <InnerWrap>
            <IconPhone />
            <Wrap>
              <Text>{t('Phone')}:</Text>
              <Text style={{ fontWeight: 400 }}>+380967972995</Text>
            </Wrap>
          </InnerWrap>
        </WrapInfoDelivery>
        <WrapInfoPay>
          <Title>{t('Payment information')}</Title>
          <TextPayment>
            <IconCard />
            {t('Payment')}:
          </TextPayment>
        </WrapInfoPay>
      </MainWrap>
    </>
  );
};
export default ViewOrderProduct;
