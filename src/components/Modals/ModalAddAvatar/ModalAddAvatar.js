import CropperWrap from 'components/CropperWrap/CropperWrap';

const { ModalTitle, ModalWindow } = require('../Modal.styled');

const ModalAddAvatar = ({ avatar, setFieldValue, setIsOpenModalAddAvatar }) => {
  return (
    <ModalWindow>
      <ModalTitle type="modal">Додати зображення профілю</ModalTitle>

      <CropperWrap
        image={avatar}
        name="avatar"
        setImage={e => setFieldValue('avatarUrl', e)}
        onClose={() => setIsOpenModalAddAvatar(false)}
      />
    </ModalWindow>
  );
};

export default ModalAddAvatar;
