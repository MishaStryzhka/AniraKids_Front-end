import Button from 'components/Button/Button';
import {
  InputModal,
  LabelModal,
  ModalTitle,
  ModalWindow,
  StyledIconCross,
} from './ModalChangePhoneNumber.syled';

const ModalChangePhoneNumber = ({ onClose }) => {
  return (
    <ModalWindow>
      <StyledIconCross
        onClick={() => {
          onClose();
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
