import Button from 'components/Button/Button';
import { ModalTitle } from '../Modal.styled';
import { useTranslation } from 'react-i18next';
import {
  GeneralModalWindow,
  TextDescriptionPhoto,
} from './ModalAttention.styled';

const ModalAttention = ({ onClick }) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.modalAttention',
  });
  return (
    <GeneralModalWindow>
      <ModalTitle>{t('Attention')}</ModalTitle>
      <TextDescriptionPhoto>
        {t('Description about the photo')}
      </TextDescriptionPhoto>
      <Button
        type="submit"
        onClick={() => {
          onClick();
        }}
      >
        {t('saveButton')}
      </Button>
    </GeneralModalWindow>
  );
};
export default ModalAttention;
