import { useTranslation } from 'react-i18next';
import {
  Description,
  StyledIconBag,
  Title,
  WrapCart,
  WrapText,
} from './EmptyCart.styled';
import Button from 'components/Button/Button';

const EmptyCart = () => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.emptyCart',
  });
  return (
    <WrapCart>
      <StyledIconBag />
      <WrapText>
        <Title>{t('Your cart is currently empty')}</Title>
        <Description>{t('Check out the news')}</Description>
      </WrapText>
      <Button>{t('Rent')}</Button>
    </WrapCart>
  );
};
export default EmptyCart;
