import Button from 'components/Button/Button';
import { ModalTitle } from '../Modal.styled';
import { useTranslation } from 'react-i18next';
import {
  GeneralModalWindow,
  TextDescriptionPhoto,
} from './ModalAttention.styled';
import Modal from '../Modal';

const ModalAttention = ({ onClick }) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.modalAttention',
  });
  return (
    <Modal
      onCloseModal={() => {
        onClick();
      }}
    >
      <GeneralModalWindow>
        <ModalTitle>{t('Attention')}</ModalTitle>
        <TextDescriptionPhoto>
          {t('Description about the photo')}
        </TextDescriptionPhoto>
        <Button
          type="submit"
          onClick={() => {
            document.body.style.overflow = 'auto';
            onClick();
          }}
        >
          {t('saveButton')}
        </Button>
      </GeneralModalWindow>
    </Modal>
  );
};
export default ModalAttention;
