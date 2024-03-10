import { useTranslation } from 'react-i18next';
import {
  ButtonAgree,
  ButtonDisagree,
  ModalTitle,
  Wrap,
} from './ModalConfirm.styled';
import Modal from '../Modal';
import { GeneralModalWindow } from '../Modal.styled';

const ModalConfirm = ({ onCloseModal, confirm, title }) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.modalConfirm',
  });
  return (
    <Modal
      onClick={() => {
        onCloseModal();
      }}
    >
      <GeneralModalWindow>
        <ModalTitle>{title || t('continue')}?</ModalTitle>
        <Wrap>
          <ButtonAgree
            onClick={() => {
              confirm();
              onCloseModal();
            }}
          >
            {t('yes')}
          </ButtonAgree>
          <ButtonDisagree
            onClick={() => {
              onCloseModal();
            }}
          >
            {t('no')}
          </ButtonDisagree>
        </Wrap>
      </GeneralModalWindow>
    </Modal>
  );
};

export default ModalConfirm;
