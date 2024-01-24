import { useTranslation } from 'react-i18next';
import {
  InputModal,
  LabelModal,
  ModalTitle,
  ModalWindow,
  Picture,
  StyledIconCross,
  StyledIconSend,
} from './ModalChangePhoto.styled';
import PhotoPlug from 'images/photo-plug.jpg';

const ModalChangePhoto = ({ onClick }) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.modalChangePhoto',
  });

  return (
    <ModalWindow>
      <StyledIconCross
        onClick={() => {
          document.body.style.overflow = 'auto';
          onClick();
        }}
      />
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
