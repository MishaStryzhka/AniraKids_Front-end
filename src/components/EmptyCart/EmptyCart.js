import { useTranslation } from 'react-i18next';
import {
  Description,
  StyledIconBag,
  Title,
  WrapCart,
  WrapText,
} from './EmptyCart.styled';
import ButtonRent from 'components/Buttons/ButtonRent/ButtonRent';

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
      <ButtonRent to="/popular">{t('Rent')}</ButtonRent>
    </WrapCart>
  );
};
export default EmptyCart;
