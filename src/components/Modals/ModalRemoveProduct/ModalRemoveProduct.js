import { useTranslation } from 'react-i18next';
import {
  ButtonAgree,
  ButtonReject,
  ModalTitle,
  ModalWindow,
  StyledIconCross,
} from './ModalRemoveProduct.styled';

const ModalRemoveProduct = ({ onClick }) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.modalRemoveProduct',
  });
  return (
    <ModalWindow>
      <StyledIconCross
        onClick={() => {
          document.body.style.overflow = 'auto';
          onClick();
        }}
      />
      <ModalTitle>{t('titleRemoveProduct')}</ModalTitle>
      <ButtonAgree>{t('yes')}</ButtonAgree>
      <ButtonReject
        onClick={() => {
          onClick();
        }}
      >
        {t('no')}
      </ButtonReject>
    </ModalWindow>
  );
};

export default ModalRemoveProduct;
