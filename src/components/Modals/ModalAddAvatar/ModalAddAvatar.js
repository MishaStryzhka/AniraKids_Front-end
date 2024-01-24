import CropperWrap from 'components/CropperWrap/CropperWrap';
import { useTranslation } from 'react-i18next';

const { ModalTitle, ModalWindow } = require('../Modal.styled');

const ModalAddAvatar = ({ avatar, setFieldValue, setIsOpenModalAddAvatar }) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.modalAddAvatar',
  });
  return (
    <ModalWindow>
      <ModalTitle type="modal">{t('Add profile picture')}</ModalTitle>

      <CropperWrap
        image={avatar}
        name="avatar"
        setImage={e => setFieldValue('avatarUrl', e)}
        onClose={() => {
          document.body.style.overflow = 'auto';
          setIsOpenModalAddAvatar(false);
        }}
      />
    </ModalWindow>
  );
};

export default ModalAddAvatar;
