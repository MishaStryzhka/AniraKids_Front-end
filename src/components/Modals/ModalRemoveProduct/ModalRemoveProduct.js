import { useTranslation } from 'react-i18next';
import {
  ButtonAgree,
  ButtonReject,
  ModalTitle,
  ModalWindow,
  StyledIconCross,
  Wrap,
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
      <Wrap>
        <ButtonAgree>{t('yes')}</ButtonAgree>
        <ButtonReject
          onClick={() => {
            onClick();
          }}
        >
          {t('no')}
        </ButtonReject>
      </Wrap>
    </ModalWindow>
  );
};

export default ModalRemoveProduct;
