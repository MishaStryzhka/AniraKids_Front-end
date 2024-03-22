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
import {
  ItemInfo,
  ListInfo,
  MarkerDelivery,
  MarkerRent,
  MarkerReturn,
  WrapCalendar,
} from 'components/Calendar/CalendarSelectDate.styled';
import ModalConfirm from 'components/Modals/ModalConfirm/ModalConfirm';

const api = require('../../api');

const Order = ({
  order: { _id: orderId, items: orderItems, owner, serviceType, rentalPeriods },
  handleRemoveOrder,
}) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.order',
  });
  const [items, setItems] = useState(orderItems);
  const [isOpenModalRemoveOrder, setIsOpenModalRemoveOrder] = useState(false);
  const [isOpenModalRemoveProduct, setIsOpenModalRemoveProduct] =
    useState(false);

  let totalAmount;
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
      <WrapCardOrder>
        <ButtonRemoveOrder
          onClick={() => {
            setIsOpenModalRemoveOrder(true);
          }}
        >
          <StyledIconBasket />
        </ButtonRemoveOrder>
        <TitleOrder>
          {t('order processing')}{' '}
          {`( ${
            serviceType === 'rent' ? `оренди на ${rentalPeriods}` : 'покупка'
          } )`}
        </TitleOrder>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {items.map(item => {
            console.log('item', item);

            return (
              <MainWrap key={item._id}>
                <WrapImage>
                  <Image src={item.product.photos[0].path} alt="product" />
                </WrapImage>
                <WrapGeneralText>
                  <WrapText>
                    <TextSeller>
                      {t('seller')}: {owner?.nickname}
                    </TextSeller>
                    <TextName>{item.product.name}</TextName>
                  </WrapText>
                  <WrapSection>
                    <Wrap>
                      <SecondaryTitle>{t('price')}:</SecondaryTitle>
                      <TextValue>{item.price} kč</TextValue>
                    </Wrap>
                    <Wrap style={{ alignItems: 'center' }}>
                      <SecondaryTitle>{t('quantity')}:</SecondaryTitle>
                      <WrapCalc>
                        {!rentalPeriods && (
                          <ButtonMath
                            disabled={item.quantity === 1}
                            onClick={() => handleDecrement(item)}
                          >
                            <StyledMinus $disabled={item.quantity === 1} />
                          </ButtonMath>
                        )}
                        <TextValue>
                          {item.quantity}
                          {rentalPeriods && ' дні'}
                        </TextValue>
                        {!rentalPeriods && (
                          <ButtonMath onClick={() => handleIncrement(item)}>
                            <IconPlus />
                          </ButtonMath>
                        )}
                      </WrapCalc>
                    </Wrap>
                    <Wrap>
                      <SecondaryTitle>{t('amount')}:</SecondaryTitle>
                      <TextValue>
                        {(totalAmount = item.price * item.quantity)} kč
                      </TextValue>
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
          <FormOrder />
          <WrapAmount>
            {serviceType === 'rent' && (
              <WrapCalendar>
                <ListInfo>
                  <ItemInfo>
                    <MarkerDelivery /> <p>дні доставки</p> <br />
                  </ItemInfo>
                  <ItemInfo>
                    <MarkerRent /> <p>оренда</p> <br />
                  </ItemInfo>
                  <ItemInfo>
                    <MarkerReturn />
                    <p>день повернення</p> <br />
                  </ItemInfo>
                </ListInfo>
                <Calendar
                  rentalPeriods={rentalPeriods}
                  setRentalPeriods={rentalPeriods => {}}
                />
              </WrapCalendar>
            )}
            <TextAmount>
              {t('orderTotal')} <span>{totalAmount} kč</span>
            </TextAmount>
            <BorderAmount />
            <TextAmount style={{ fontWeight: 700, marginBottom: '40px' }}>
              {t('totalAmount')}
              <span>{totalAmount} kč</span>
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
