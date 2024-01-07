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
  return (
    <ModalWindow>
      <StyledIconCross
        onClick={() => {
          document.body.style.overflow = 'auto';
          onClick();
        }}
      />
      <ModalTitle>Додати фото</ModalTitle>
      <Picture>
        <img src={PhotoPlug} alt="Фото-заглушка" />
      </Picture>
      <LabelModal>
        <InputModal placeholder="Напишіть  Ваше повідомлення..." />
        <StyledIconSend />
      </LabelModal>
    </ModalWindow>
  );
};

export default ModalChangePhoto;
