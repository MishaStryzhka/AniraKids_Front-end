import { useTranslation } from 'react-i18next';
import { Description } from './CartDescription.styled';

const CartDescription = () => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.cartDescription',
  });

  return <Description>{t('description')}</Description>;
};

export default CartDescription;
