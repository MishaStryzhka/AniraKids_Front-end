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
import Calendar from 'components/Calendar/Calendar';
import { WrapCalendar } from 'components/Calendar/CalendarSelectDate.styled';
import ModalConfirm from 'components/Modals/ModalConfirm/ModalConfirm';
import CalendarDescription from 'components/Calendar/components/CalendarDescription/CalendarDescription';
import ButtonRent from 'components/Buttons/ButtonRent/ButtonRent';

const api = require('../../api');

const Order = ({ order: dataOrder, handleRemoveOrder }) => {
  const [order, setOrder] = useState(dataOrder);
  console.log('order', order);

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

  const handleIncrementQuantity = ({ _id: productId, quantity }) => {
    api
      .setQuantity({ productId, quantity: quantity + 1 })
      .then(({ order, updatedItem }) => {
        setOrder(order);
        setItems(prevItems =>
          prevItems.map(item =>
            item._id === updatedItem._id ? updatedItem : item
          )
        );
      });
  };

  const handleDecrementQuantity = ({ _id: productId, quantity }) => {
    if (quantity > 1) {
      api
        .setQuantity({ productId, quantity: quantity - 1 })
        .then(({ order, updatedItem }) => {
          setOrder(order);
          setItems(prevItems =>
            prevItems.map(item =>
              item._id === updatedItem._id ? updatedItem : item
            )
          );
        });
    }
  };

  const handleIncrementQuantityHours = ({ _id: orderId, quantityHours }) => {
    api
      .setQuantityHours({ orderId, quantityHours: quantityHours + 1 })
      .then(({ order }) => {
        setOrder(order);
      });
  };

  const handleDecrementQuantityHours = ({ _id: orderId, quantityHours }) => {
    api
      .setQuantityHours({ orderId, quantityHours: quantityHours - 1 })
      .then(({ order }) => {
        setOrder(prevOrder => ({
          ...prevOrder,
          quantityHours: order.quantityHours,
        }));
      });
  };

  const handleRemove = productId => {
    if (items.length === 1) {
      handleRemoveOrder();
    } else {
      api.removeProductFromOrder(orderId, productId).then(data => {
        setOrder(data.order);
        setItems(prefItems => prefItems.filter(item => item._id !== productId));
      });
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

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            position: 'relative',
          }}
        >
          {items.map(item => {
            return (
              <div
                key={item?._id}
                style={{
                  position: 'relative',
                }}
              >
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
                        {!rentalPeriods ? (
                          <TextValue>{item?.price?.salePrice} kč</TextValue>
                        ) : typeRent === 'celebration' ? (
                          <TextValue>
                            {item?.price?.dailyRentalPrice} kč
                          </TextValue>
                        ) : (
                          <TextValue>
                            {item?.price?.hourlyRentalPrice} kč
                          </TextValue>
                        )}
                      </Wrap>
                      <Wrap style={{ alignItems: 'center' }}>
                        {typeRent === 'photosession' && (
                          <>
                            <SecondaryTitle>
                              {t('quantity_of_hours')}:
                            </SecondaryTitle>
                            <WrapCalc>
                              <ButtonMath
                                disabled={order?.quantityHours <= 5}
                                onClick={() =>
                                  handleDecrementQuantityHours(order)
                                }
                              >
                                <StyledMinus $disabled={item?.quantity === 1} />
                              </ButtonMath>
                              <TextValue>{order?.quantityHours}</TextValue>
                              <ButtonMath
                                disabled={order?.quantityHours >= 24}
                                onClick={() =>
                                  handleIncrementQuantityHours(order)
                                }
                              >
                                <IconPlus />
                              </ButtonMath>
                            </WrapCalc>
                          </>
                        )}
                        {typeRent === 'celebration' && (
                          <>
                            <SecondaryTitle>
                              {t('quantity_of_days')}:
                            </SecondaryTitle>
                            <TextValue>{order.quantityDays}</TextValue>
                          </>
                        )}
                        {serviceType === 'buy' && (
                          <>
                            <SecondaryTitle>{t('quantity')}:</SecondaryTitle>
                            <WrapCalc>
                              <ButtonMath
                                disabled={item?.quantity === 1}
                                onClick={() => handleDecrementQuantity(item)}
                              >
                                <StyledMinus $disabled={item?.quantity === 1} />
                              </ButtonMath>
                              <TextValue>{item.quantity}</TextValue>
                              <ButtonMath
                                onClick={() => handleIncrementQuantity(item)}
                              >
                                <IconPlus />
                              </ButtonMath>
                            </WrapCalc>
                          </>
                        )}
                      </Wrap>
                      <Wrap>
                        <SecondaryTitle>{t('amount')}:</SecondaryTitle>
                        {typeRent === 'photosession' && (
                          <TextValue>
                            {item?.price?.hourlyRentalPrice *
                              order?.quantityHours}{' '}
                            kč
                          </TextValue>
                        )}
                        {typeRent === 'celebration' && (
                          <TextValue>
                            {item?.price?.dailyRentalPrice *
                              order?.quantityDays}{' '}
                            kč
                          </TextValue>
                        )}
                        {serviceType === 'buy' && (
                          <TextValue>
                            {item?.price?.salePrice * item?.quantity} kč
                          </TextValue>
                        )}
                      </Wrap>
                      <ButtonDelete
                        onClick={() => setIsOpenModalRemoveProduct(item)}
                      >
                        <StyledIconBasket />
                      </ButtonDelete>
                    </WrapSection>
                  </WrapGeneralText>
                </MainWrap>
                {item?.product?.status === 'inactive' && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      width: '100%',
                      height: '100%',
                      backgroundColor: '#EFEFEF80',
                      backdropFilter: 'blur(1px)',
                      WebkitBackdropFilter: 'blur(1px)',
                      textAlign: 'center',
                      alignContent: 'center',
                      fontWeight: 700,
                      fontSize: 18,
                    }}
                  >
                    Цей продукт недоступний!
                  </div>
                )}
              </div>
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
            <BorderAmount />
            <TextAmount>
              {t('totalPrice')} <span>{totalPrice} kč</span>
            </TextAmount>
            {typeRent === 'celebration' && (
              <TextAmount>
                Počet dni <span>{quantityDays}</span>
              </TextAmount>
            )}

            <BorderAmount />
            <TextAmount style={{ fontWeight: 700, marginBottom: '40px' }}>
              {t('orderTotal')}
              <span>{totalOrderPrice} kč</span>
            </TextAmount>
            <ButtonRent
              form="orderForm"
              type="submit"
              disabled={items.some(
                item => item?.product?.status === 'inactive'
              )}
            >
              {items.some(item => item?.product?.status === 'inactive')
                ? 'Замовлення містить недоступні продукти!'
                : t('Continue')}
            </ButtonRent>
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
