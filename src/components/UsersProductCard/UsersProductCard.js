import { useTranslation } from 'react-i18next';
import {
  ButtonRemove,
  ButtonUpdate,
  GeneralWrap,
  IconBasketStyled,
  IconPencilStyled,
  Image,
  Card,
  PictureCard,
  Price,
  Span,
  TextName,
  TextPrice,
  TextSize,
  Wrap,
} from './UsersProductCard.styled';
import { WrapText } from 'components/ProductCard/ProductCard.styled';

const UsersProductCard = ({ product, handleRemove, handleUpdate }) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.usersProductCard',
  });
  console.log(product);
  return (
    <Card>
      <GeneralWrap>
        <PictureCard>
          <Image src={product?.photos[0]?.path} alt="Фотографія продукту" />
        </PictureCard>
        <WrapText>
          <Wrap>
            <TextName>{product.brand}</TextName>
            <TextSize>
              <Span>{t('Size')}:</Span>
              {product.size}
            </TextSize>
          </Wrap>
          <Wrap>
            {product.rental ? (
              <Price>{t('Rental')}</Price>
            ) : (
              product.sale && <Price>{t('Sale')}</Price>
            )}
            {product.rentalPrice && (
              <TextPrice>{product.rentalPrice} CZK</TextPrice>
            )}
            {product.salePrice && (
              <TextPrice>{product.salePrice} CZK</TextPrice>
            )}
          </Wrap>
        </WrapText>
      </GeneralWrap>
      <ButtonUpdate type="button" onClick={() => handleUpdate(product._id)}>
        {t('update')}
        <IconPencilStyled />
      </ButtonUpdate>
      <ButtonRemove type="button" onClick={() => handleRemove(product._id)}>
        {t('remove')}
        <IconBasketStyled />
      </ButtonRemove>
    </Card>
  );
};

export default UsersProductCard;
