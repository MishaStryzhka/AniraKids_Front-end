import { useTranslation } from 'react-i18next';
import {
  InputModal,
  LabelModal,
  ModalTitle,
  ModalWindow,
  Picture,
  StyledIconSend,
} from './ModalChangePhoto.styled';
import PhotoPlug from 'images/photo-plug.jpg';

const ModalChangePhoto = ({ onClick }) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.modalChangePhoto',
  });

  return (
    <ModalWindow>
      <ModalTitle>{t('addPhoto')}</ModalTitle>
      <Picture>
        <img src={PhotoPlug} alt="Фото-заглушка" />
      </Picture>
      <LabelModal>
        <InputModal placeholder={t('textPlaceholder')} />
        <StyledIconSend />
      </LabelModal>
    </ModalWindow>
  );
};

export default ModalChangePhoto;
