import Button from 'components/Button/Button';
import {
  InputModal,
  LabelModal,
  ModalTitle,
  ModalWindow,
  StyledIconCross,
} from './ModalChangePhoneNumber.syled';

const ModalChangePhoneNumber = ({ onClick }) => {
  return (
    <ModalWindow>
      <StyledIconCross
        onClick={() => {
          document.body.style.overflow = 'auto';
          onClick();
        }}
      />
      <ModalTitle>Змінити номер телефону</ModalTitle>
      <LabelModal>
        Номер телефону
        <InputModal placeholder="+380" />
      </LabelModal>
      <Button>Зберегти</Button>
    </ModalWindow>
  );
};

export default ModalChangePhoneNumber;
