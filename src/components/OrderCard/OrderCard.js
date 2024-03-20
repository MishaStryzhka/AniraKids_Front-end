import { useTranslation } from 'react-i18next';
import {
  Image,
  Picture,
  StatusSuccess,
  TextDate,
  TextName,
  TextOrder,
  TextSize,
  WrapCard,
  StyledIconCheck,
  FirstWrap,
  SecondWrap,
  Wrap,
  TextPrice,
} from './OrderCard.styled';
import { ButtonViewMore } from 'components/Buttons/ButtonViewMore/ButtonViewMore';
import { useLocation } from 'react-router-dom';
// import IconShopCartRejected from 'images/icons/IconShopCartRejected';

const OrderCard = ({ product }) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.orderCard',
  });

  const { pathname } = useLocation();
  const $pageMyOrders = pathname === '/my-account/my-orders';
  const $pageMyPurchases = pathname === `/my-account/my-purchases`;
  return (
    <WrapCard
      $pageMyOrders={pathname === `/my-account/my-orders`}
      //   $pageMyPurchases={pathname === `/my-account/my-purchases`}
    >
      <Picture $pageMyPurchases={pathname === `/my-account/my-purchases`}>
        <Image src={product?.photos[0]?.path} alt="Фотографія продукту" />
      </Picture>
      <Wrap>
        <FirstWrap>
          <div>
            <TextOrder>
              {t('order')}
              <span style={{ marginLeft: '6px' }}>N0123456789</span>
            </TextOrder>
            <TextDate>23 вересня 2023</TextDate>
            {$pageMyPurchases && (
              <TextPrice>{t('Deposit amount')}10 000</TextPrice>
            )}
          </div>

          <StatusSuccess>
            {t('paid')}
            <StyledIconCheck />
          </StatusSuccess>
        </FirstWrap>
        <SecondWrap>
          <div>
            <TextName
              $pageMyPurchases={pathname === `/my-account/my-purchases`}
            >
              {product.name}
            </TextName>
            {$pageMyOrders && (
              <TextSize>
                {t('size')}:
                <span style={{ marginLeft: '6px' }}>
                  {product.size || product.childSize}
                </span>
              </TextSize>
            )}
          </div>
          {/* <StatusRejected>
        {t('rejected')}
        <IconShopCartRejected />
      </StatusRejected> */}

          <ButtonViewMore>{t('viewMore')}</ButtonViewMore>
        </SecondWrap>
      </Wrap>
    </WrapCard>
  );
};

export default OrderCard;
