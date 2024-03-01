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
  // WrapRent,
} from './Order.styled';
import { useTranslation } from 'react-i18next';
import IconPlus from 'images/icons/IconPlus';

const api = require('../../api');

const Order = ({ order, handleRemoveOrder }) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.order',
  });

  const [items, setItems] = useState(order.items);

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
        .removeProductFromOrder(order._id, productId)
        .then(data =>
          setItems(prefItems =>
            prefItems.filter(item => item._id !== productId)
          )
        );
    }
  };
  console.log(items);
  return (
    <WrapCardOrder>
      <TitleOrder>
        {t('order processing')} {`( ${items[0].serviceType} )`}
      </TitleOrder>

      <div>
        {items.map(item => {
          return (
            <MainWrap key={item._id}>
              <WrapImage>
                <Image src={item.product.photos[0].path} alt="product" />
              </WrapImage>
              <WrapGeneralText>
                <WrapText>
                  <TextSeller>
                    {t('seller')}: {item.owner.nickname}
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
                      <ButtonMath
                        disabled={item.quantity === 1}
                        onClick={() => handleDecrement(item)}
                      >
                        <StyledMinus $disabled={item.quantity === 1} />
                      </ButtonMath>
                      <TextValue style={{ fontWeight: 400 }}>
                        {item.quantity}
                      </TextValue>
                      <ButtonMath onClick={() => handleIncrement(item)}>
                        <IconPlus />
                      </ButtonMath>
                    </WrapCalc>
                  </Wrap>
                  <Wrap>
                    <SecondaryTitle>{t('amount')}:</SecondaryTitle>
                    <TextValue>{item.price * item.quantity} kč</TextValue>
                  </Wrap>
                  <ButtonDelete onClick={() => handleRemove(item._id)}>
                    <StyledIconBasket />
                  </ButtonDelete>
                </WrapSection>
              </WrapGeneralText>
            </MainWrap>
          );
        })}
      </div>
      {/* <WrapRent>
          <LabelStatus>
                            <Box>{values.rental && <IconCheck />}</Box>
                            {t('Rental')}
                            <Input
                              type="checkbox"
                              name="rental"
                              value={values.rental}
                              onChange={e => {
                                e.currentTarget.value === 'true' &&
                                  setFieldValue('rentalPrice', '');
                                handleChange(e);
                              }}
                              onBlur={handleBlur}
          />
           </LabelStatus>
           <LabelStatus>
                            <Box>{values.sale && <IconCheck />}</Box>
                            {t('Sale')}
                            <Input
                              type="checkbox"
                              name="sale"
                              value={values.sale}
                              onChange={e => {
                                e.currentTarget.value === 'true' &&
                                  setFieldValue('salePrice', '');
                                handleChange(e);
                              }}
                              onBlur={handleBlur}
                            />
                          </LabelStatus>
      </WrapRent> */}
      <FormOrder />
    </WrapCardOrder>
  );
};

export default Order;
