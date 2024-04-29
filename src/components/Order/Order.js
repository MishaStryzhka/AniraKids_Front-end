import FormOrder from 'components/Forms/FormOrder/FormOrder';
import { useState } from 'react';
import {
  TitleOrder,
  WrapCardOrder,
  MainWrap,
  WrapImage,
  Image,
  TextSeller,
  TextName,
  TextValue,
  SecondaryTitle,
  WrapSection,
  ButtonDelete,
  Wrap,
  WrapCalc,
  WrapText,
  ButtonMath,
  StyledMinus,
  StyledIconBasket,
  WrapGeneralText,
  WrapAmount,
  TextAmount,
  BorderAmount,
  WrapInside,
  ButtonRemoveOrder,
} from './Order.styled';
import { useTranslation } from 'react-i18next';
import IconPlus from 'images/icons/IconPlus';
import Button from 'components/Button/Button';
import Calendar from 'components/Calendar/Calendar';
import { WrapCalendar } from 'components/Calendar/CalendarSelectDate.styled';
import ModalConfirm from 'components/Modals/ModalConfirm/ModalConfirm';
import CalendarDescription from 'components/Calendar/components/CalendarDescription/CalendarDescription';

const api = require('../../api');

const Order = ({ order, handleRemoveOrder }) => {
  const {
    _id: orderId,
    items: orderItems,
    owner,
    serviceType,
    typeRent,
    totalPrice,
    totalOrderPrice,
    quantityDays,
    rentalPeriods,
  } = order;
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.order',
  });
  const [items, setItems] = useState(orderItems);
  const [isOpenModalRemoveOrder, setIsOpenModalRemoveOrder] = useState(false);
  const [isOpenModalRemoveProduct, setIsOpenModalRemoveProduct] =
    useState(false);

  const handleIncrement = ({ _id: productId, quantity }) => {
    api
      .setQuantity({ productId, quantity: quantity + 1 })
      .then(({ updatedItem }) => {
        setItems(prevItems =>
          prevItems.map(item =>
            item._id === updatedItem._id ? updatedItem : item
          )
        );
      });
  };

  const handleDecrement = ({ _id: productId, quantity }) => {
    if (quantity > 1) {
      api
        .setQuantity({ productId, quantity: quantity - 1 })
        .then(({ updatedItem }) => {
          setItems(prevItems =>
            prevItems.map(item =>
              item._id === updatedItem._id ? updatedItem : item
            )
          );
        });
    }
  };

  const handleRemove = productId => {
    if (items.length === 1) {
      handleRemoveOrder();
    } else {
      api
        .removeProductFromOrder(orderId, productId)
        .then(data =>
          setItems(prefItems =>
            prefItems.filter(item => item._id !== productId)
          )
        );
    }
  };

  return (
    <>
      <WrapCardOrder name={orderId}>
        <ButtonRemoveOrder
          onClick={() => {
            setIsOpenModalRemoveOrder(true);
          }}
        >
          <StyledIconBasket />
        </ButtonRemoveOrder>
        <TitleOrder>
          {serviceType === 'rent'
            ? t('Rental Order', { typeRent: t(typeRent), rentalPeriods })
            : t('Purchase Order')}
        </TitleOrder>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {items.map(item => {
            // console.log('item', item);

            return (
              <MainWrap key={item?._id}>
                <WrapImage>
                  <Image src={item?.product?.photos[0]?.path} alt="product" />
                </WrapImage>
                <WrapGeneralText>
                  <WrapText>
                    <TextSeller>
                      {t('seller')}: {owner?.nickname}
                    </TextSeller>
                    <TextName>{item?.product?.name}</TextName>
                  </WrapText>
                  <WrapSection>
                    <Wrap>
                      <SecondaryTitle>{t('price')}:</SecondaryTitle>
                      <TextValue>{item?.price} kč</TextValue>
                    </Wrap>
                    <Wrap style={{ alignItems: 'center' }}>
                      <SecondaryTitle>{t('quantity')}:</SecondaryTitle>
                      <WrapCalc>
                        {!rentalPeriods && (
                          <ButtonMath
                            disabled={item?.quantity === 1}
                            onClick={() => handleDecrement(item)}
                          >
                            <StyledMinus $disabled={item?.quantity === 1} />
                          </ButtonMath>
                        )}
                        <TextValue>{item.quantity}</TextValue>
                        {!rentalPeriods && (
                          <ButtonMath onClick={() => handleIncrement(item)}>
                            <IconPlus />
                          </ButtonMath>
                        )}
                      </WrapCalc>
                    </Wrap>
                    <Wrap>
                      <SecondaryTitle>{t('amount')}:</SecondaryTitle>
                      <TextValue>{item?.price * item?.quantity} kč</TextValue>
                    </Wrap>
                    <ButtonDelete
                      onClick={() => setIsOpenModalRemoveProduct(item)}
                    >
                      <StyledIconBasket />
                    </ButtonDelete>
                  </WrapSection>
                </WrapGeneralText>
              </MainWrap>
            );
          })}
        </div>
        <WrapInside>
          <FormOrder order={order} />
          <WrapAmount>
            {serviceType === 'rent' && (
              <WrapCalendar>
                <Calendar
                  selectsRange={typeRent === 'celebration'}
                  rentalPeriods={rentalPeriods}
                  setRentalPeriods={rentalPeriods => {}}
                />
                <CalendarDescription typeRent={typeRent} />
              </WrapCalendar>
            )}
            <TextAmount>
              {t('totalPrice')} <span>{totalPrice} kč</span>
            </TextAmount>
            <TextAmount>
              {console.log('rentalPeriods', rentalPeriods)}
              Počet dni <span>{quantityDays}</span>
            </TextAmount>

            <BorderAmount />
            <TextAmount style={{ fontWeight: 700, marginBottom: '40px' }}>
              {t('orderTotal')}
              <span>{totalOrderPrice} kč</span>
            </TextAmount>
            <Button form="orderForm" type="submit">
              {t('Continue')}
            </Button>
          </WrapAmount>
        </WrapInside>
      </WrapCardOrder>
      {isOpenModalRemoveOrder && (
        <ModalConfirm
          onCloseModal={() => setIsOpenModalRemoveOrder(false)}
          title={`Видалити замовлення${
            rentalPeriods ? ` на ${rentalPeriods}` : ''
          }?`}
          confirm={() => handleRemoveOrder()}
        />
      )}
      {isOpenModalRemoveProduct && (
        <ModalConfirm
          onCloseModal={() => setIsOpenModalRemoveProduct(false)}
          title={`Видалити товар: '${isOpenModalRemoveProduct.product.name}'`}
          confirm={() => handleRemove(isOpenModalRemoveProduct._id)}
        />
      )}
    </>
  );
};

export default Order;
