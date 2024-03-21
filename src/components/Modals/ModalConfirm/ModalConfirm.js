import { useTranslation } from 'react-i18next';
import {
  ButtonAgree,
  ButtonDisagree,
  Description,
  ModalTitle,
  Wrap,
} from './ModalConfirm.styled';
import Modal from '../Modal';
import { GeneralModalWindow } from '../Modal.styled';

const ModalConfirm = ({
  onCloseModal,
  confirm,
  title,
  onClickDisagree,
  titleButtonDisagree,
  description,
}) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.modalConfirm',
  });
  return (
    <Modal
      onCloseModal={() => {
        onCloseModal();
      }}
    >
      <GeneralModalWindow>
        <ModalTitle>{title || t('continue')}?</ModalTitle>
        {description && <Description>{description}</Description>}
        <Wrap>
          <ButtonAgree
            onClick={() => {
              confirm();
              onCloseModal();
              document.body.style.overflow = 'auto';
            }}
          >
            {t('yes')}
          </ButtonAgree>
          <ButtonDisagree
            onClick={
              onClickDisagree
                ? () => {
                    onClickDisagree();
                    document.body.style.overflow = 'auto';
                  }
                : () => {
                    onCloseModal();
                    document.body.style.overflow = 'auto';
                  }
            }
          >
            {titleButtonDisagree || t('no')}
          </ButtonDisagree>
        </Wrap>
      </GeneralModalWindow>
    </Modal>
  );
};

export default ModalConfirm;
